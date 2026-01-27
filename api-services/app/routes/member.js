const express = require('express');
const { where } = require('../lib/utils/queryBuilder.js');
const sendMail = require('../lib/utils/sendMail.js');
const db = require('../config/db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { randomInt } = require('crypto');
const paginate = require('../lib/hooks/paginate.js');


const app = express();
const router = express.Router();
router.get('/members', (req, res) => {
    const authorization = req.headers['authorization'];
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { queryResult, fields, values } = where(req);

        let query = 'SELECT id, fullname, username, email, phone_number FROM members';
        if (fields.length > 0) {
            query += queryResult;
        }

        query += ' ORDER BY createdAt DESC';

        if (limit > 0) {
            query += ' LIMIT ' + limit + ' OFFSET ' + offset;
        }

        db.execute(query, values)
            .then(([rows]) => {
                let countQuery = 'SELECT COUNT(*) AS totalCount FROM members';
                if (fields.length > 0) {
                    countQuery += queryResult;
                }
                const countResult = db.execute(countQuery, values).then(([rows]) => rows[0]);
                const total = countResult.totalCount;
                return res.status(200).json(paginate(req, rows, total));
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});
router.post('/login', (req, res) => {
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Email/password harus diisi' });
    }
    try {
        const query = 'SELECT * FROM members WHERE  email = ? and user_status != 1 LIMIT 1';

        db.execute(query, [username])
            .then(([rows]) => {
                if (rows.length > 0) {
                    const hashedPassword = rows[0].password;
                    const passwordMatch = bcrypt.compareSync(password, hashedPassword);
                    if (!passwordMatch) {
                        return res.status(401).json({ success: false, message: 'Email atau password salah' });
                    }
                    return res.status(200).json({ success: true, message: 'Login berhasil', user: { fullname: rows[0].fullname, email: rows[0].email, phone_number: rows[0].phone_number, username: rows[0].username, slug: rows[0].slug, id: rows[0].id }, username: rows[0].fullname, token: jwt.sign({ slug: rows[0].slug, fullname: rows[0].fullname, username: rows[0].username, email: rows[0].email, phone_number: rows[0].phone_number }, process.env.JWT_SECRET, { expiresIn: '1d' }) });
                } else {
                    return res.status(404).json({ success: false, message: 'Email tidak terdaftar' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: error.message });
    }
});
router.post('/login-with-google', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email harus diisi' });
    }
    try {
        const query = 'SELECT * FROM members WHERE email = ? and user_status != 1 LIMIT 1';
        db.execute(query, [email])
            .then(([rows]) => {
                if (rows.length > 0) {
                    const user = rows[0];
                    const token = jwt.sign({ slug: user.slug, fullname: user.fullname, username: user.username, email: user.email, phone_number: user.phone_number }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    return res.status(200).json({ success: true, message: 'Login berhasil', user, token });
                } else {
                    return res.status(404).json({ success: false, message: 'Email tidak terdaftar' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan login', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan login', error: error.message });
    }

});

router.post('/register', (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ success: false, message: 'Email harus diisi' });
    }
    if (!req.body.email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email tidak valid' });
    }
    if (req.body.password) {
        if (req.body.password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ success: false, message: 'Password dan konfirmasi password tidak cocok' });
        }
    }

    try {
        const searchUserQuery = 'SELECT * FROM members WHERE email = ? LIMIT 1';

        db.execute(searchUserQuery, [req.body.email])
            .then(async ([rows]) => {
                if (rows.length > 0) {
                    if (rows[0].is_verified == 'N') {
                        const codeVerify = randomInt(100000, 999999);

                        const hashedPassword = await bcrypt.hash(req.body.password, 10);
                        const query = "UPDATE members SET password = ?, user_status = ?, otp_code = ?, otp_expires_at = ? WHERE email = ?";
                        let otp = "";
                        let expired = "";
                        if (rows[0].otp_code === null) {
                            otp = codeVerify;
                            expired = new Date(Date.now() + 60 * 60 * 1000);
                        } else {
                            otp = rows[0].otp_code;
                            expired = rows[0].otp_expires_at;
                        }
                        await db.execute(query, [hashedPassword, 1, otp, expired, req.body.email]).then(async () => {

                            const mailResult = await sendMail({
                                to: req.body.email,
                                templateUrl: 'otp.html',
                                subject: 'OTP Verification',
                                action_url: ``,
                                html: {
                                    title: 'Kode Verifikasi anda',
                                    description: otp.toString(),
                                }
                            });
                            if (mailResult.status === false) {
                                return res.status(500).json({
                                    success: false, message: mailResult.message, error: mailResult.error
                                });
                            }
                            return res.status(200).json({
                                success: true,
                                message: 'Registrasi berhasil',
                                user: {
                                    id: rows[0].id,
                                    slug: rows[0].slug,
                                    fullname: rows[0].fullname,
                                    username: rows[0].username,
                                    email: req.body.email,
                                    phone_number: rows[0].phone_number,
                                    image: rows[0].image,
                                    user_status: rows[0].user_status
                                }
                            });
                        }).catch((err) => {
                            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
                        });
                        return;
                    } else {
                        return res.status(400).json({ success: false, message: 'Email telah terdaftar. Silahkan login.' });
                    }
                } else {

                    const slug = uuidv4().toString();
                    const password = req.body.password ? req.body.password : null;
                    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
                    const username = req.body.email ? req.body.email.split('@')[0] : null;

                    const provider_account_id = Date.now();
                    const provider = 'credentials';
                    const provider_type = 'credentials';
                    const codeVerify = randomInt(100000, 999999);
                    const codeExpired = new Date(Date.now() + 60 * 60 * 1000);
                    const query = 'INSERT INTO members (slug, username, email,password,provider_account_id,provider,provider_type, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ? , ?)';
                    db.execute(query, [slug, username, req.body.email, hashedPassword, provider_account_id, provider, provider_type, codeVerify, codeExpired])
                        .then(async (result) => {

                            const mailResult = await sendMail({
                                to: req.body.email,
                                templateUrl: 'otp.html',
                                subject: 'OTP Verification',
                                action_url: ``,
                                html: {
                                    title: 'Kode Verifikasi anda',
                                    description: codeVerify.toString(),
                                }
                            });
                            if (mailResult.status === false) {
                                return res.status(500).json({
                                    success: false, message: mailResult.message, error: mailResult.error
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message: 'Registrasi berhasil',
                                user: {
                                    id: result.insertId,
                                    slug: slug,
                                    fullname: req.body.fullname || null,
                                    username: username,
                                    email: req.body.email,
                                    phone_number: req.body.phone_number || null,
                                    image: null,
                                    user_status: null
                                }
                            });
                        })
                        .catch((err) => {
                            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
                        });

                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: error.message });
    }
});

router.post('/register-with-google', (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ success: false, message: 'Email harus diisi' });
    }
    const slug = uuidv4().toString();
    const email = req.body.email;
    const username = req.body.email ? req.body.email.split('@')[0] : null;
    const fullname = req.body.name ? req.body.name : null;
    const provider_account_id = req.body.id ? req.body.id : Date.now();
    const image = req.body.image;
    const provider = 'google';
    const provider_type = 'google';
    try {
        const searchUserQuery = 'SELECT * FROM members WHERE email = ?  LIMIT 1';
        db.execute(searchUserQuery, [email])
            .then(async ([rows]) => {
                if (rows.length > 0) {
                    if (rows[0].is_verified == 'N') {
                        let hashedPassword = rows[0].password;
                        if (req.body.password) {
                            hashedPassword = await bcrypt.hash(req.body.password, 10);
                        }

                        const codeVerify = randomInt(100000, 999999);
                        const codeExpired = new Date(Date.now() + 60 * 60 * 1000);
                        const query = "UPDATE members SET user_status = ?, password = ? , otp_code = ?, otp_expires_at = ? WHERE email = ?";
                        await db.execute(query, [1, hashedPassword, codeVerify, codeExpired, email]).then(async () => {
                            const mailResult = await sendMail({
                                to: email,
                                templateUrl: 'otp.html',
                                subject: 'OTP Verification',
                                action_url: ``,
                                html: {
                                    title: 'Kode Verifikasi anda',
                                    description: codeVerify.toString(),
                                }
                            });
                            if (mailResult.status === false) {
                                return res.status(500).json({
                                    success: false, message: mailResult.message, error: mailResult.error
                                });
                            }
                            return res.status(200).json({
                                success: true,
                                message: 'Registrasi berhasil',
                                user: {
                                    id: rows[0].id,
                                    slug: rows[0].slug,
                                    fullname: rows[0].fullname,
                                    username: rows[0].username,
                                    email: req.body.email,
                                    phone_number: rows[0].phone_number,
                                    image: rows[0].image,
                                    user_status: rows[0].user_status
                                }
                            });
                        }).catch((err) => {
                            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
                        });
                    } else {
                        return res.status(400).json({ success: false, message: 'Email telah terdaftar. Silahkan login.' });
                    }
                } else {
                    const codeVerify = randomInt(100000, 999999);
                    const codeExpired = new Date(Date.now() + 60 * 60 * 1000);
                    const query = 'INSERT INTO members (slug, username,fullname, email,image,provider_account_id,provider,provider_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                    db.execute(query, [slug, username, fullname, email, image, provider_account_id, provider, provider_type])
                        .then(async (result) => {
                            return res.status(200).json({
                                success: true,
                                message: 'Registrasi berhasil',
                                user: {
                                    id: provider_account_id,
                                    slug: slug,
                                    fullname: fullname,
                                    username: username,
                                    email: email,
                                    phone_number: null,
                                    image: image,
                                    user_status: 1,
                                    is_verified: 'N'
                                }
                            });
                        }).catch((err) => {
                            return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
                        });
                }
            }).catch((err) => {
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat melakukan registrasi', error: error.message });
    }
});

router.get('/logout', (req, res) => {
    const authorization = req.headers['authorization'];
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const query = 'UPDATE members SET last_login = NOW() WHERE slug = ?';
        db.execute(query, [decoded.slug])
            .then(() => {
                return res.status(200).json({ success: true, message: 'Logout successful' });
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.get('/profile', (req, res) => {
    const authorization = req.headers['authorization'];
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const query = 'SELECT fullname, username, email, phone_number FROM members WHERE slug =? LIMIT 1';
        db.execute(query, [decoded.slug])
            .then(([rows]) => {
                if (rows.length > 0) {
                    return res.status(200).json({ success: true, message: 'Profile retrieved successfully', profile: rows[0] });
                } else {
                    return res.status(404).json({ success: false, message: 'Profile not found' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.post('/forgot-password', (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const query = 'SELECT * FROM members WHERE email = ? LIMIT 1';
        db.execute(query, [email])
            .then(async ([rows]) => {
                if (rows.length > 0) {
                    const mailResult = await sendMail({
                        to: email,
                        subject: 'Password Reset',
                        action_url: `${process.env.REDIRECT_EMAIL_URL}/reset-password?email=${email}`,
                        action_text: 'Reset Password',
                    });
                    if (mailResult.status === false) {
                        return res.status(500).json({ success: false, message: mailResult.message, error: mailResult.error });
                    }
                    return res.status(200).json({ success: true, message: mailResult.message || 'Password reset link sent successfully' });

                } else {
                    return res.status(404).json({ success: false, message: 'Email not found' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.get('/check-user-by-email', (req, res) => {
    const email = req.query.email || req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const query = 'SELECT * FROM members WHERE email = ? and user_status > 1 LIMIT 1';
        db.execute(query, [email])
            .then(([rows]) => {
                if (rows.length > 0) {
                    return res.status(200).json({
                        success: true, message: 'User found'
                    });
                } else {
                    return res.status(200).json({ success: false, message: 'User not found' });
                }
            })
            .catch((err) => {
                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.post('/send-email-code-verification', async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const query = 'SELECT otp_code, otp_expires_at FROM members WHERE email = ? LIMIT 1';
        await db.execute(query, [email]).then(async ([rows]) => {
            if (rows.length > 0) {
                const mailResult = await sendMail({
                    to: email,
                    templateUrl: 'otp.html',
                    subject: 'OTP Verification',
                    action_url: ``,
                    html: {
                        title: 'Kode Verifikasi anda',
                        description: rows[0].otp_code.toString(),
                    }
                });
                if (mailResult.status === false) {
                    return res.status(500).json({
                        success: false, message: mailResult.message, error: mailResult.error
                    });
                }
                return res.status(200).json({
                    success: true, message: mailResult.message || 'Email sent successfully'
                });
            } else {
                return null;
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.put('/register-completed/:email', (req, res) => {
    const email = req.params.email;
    const codeVerify = req.body.code;
    if (!codeVerify) {
        return res.status(400).json({ message: 'OTP is required' });
    }
    if (codeVerify.length < 6) {
        return res.status(400).json({ message: 'OTP must be 6 digits' });
    }
    const query = 'SELECT * FROM members WHERE email = ? LIMIT 1';
    db.execute(query, [email])
        .then(([rows]) => {
            if (rows.length > 0) {
                if (rows[0].otp_code == codeVerify) {
                    if (rows[0].otp_expires_at < new Date()) {
                        return res.status(400).json({ success: false, message: 'OTP has expired' });
                    } else {
                        const query = 'UPDATE members SET user_status = ? , is_verified = ? , otp_code = ?, otp_expires_at = ? WHERE email = ?';
                        db.execute(query, [2, 'Y', null, null, email])
                            .then(([rows]) => {
                                if (rows.affectedRows > 0) {
                                    return res.status(200).json({ success: true, message: 'Registration completed' });
                                } else {
                                    return res.status(404).json({ success: false, message: 'Email tidak terdaftar' });
                                }
                            })
                            .catch((err) => {
                                return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
                            });
                    }
                } else {
                    return res.status(400).json({ message: 'Invalid OTP' });
                }
            } else {
                return res.status(404).json({ message: 'Email not found' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
        });
});


module.exports = router;