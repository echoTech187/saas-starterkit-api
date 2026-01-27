const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const sendMail = async ({ to, templateUrl, subject, action_url, html }) => {
    try {
        // 1. Read and compile the template
        let htmlFilePath = "";
        if (subject === "Password Reset") {
            htmlFilePath = path.join(__dirname, '../../templates/forgot-password.html');
        } else {
            htmlFilePath = path.join(__dirname, `../../templates/${templateUrl}`);
        }
        const source = fs.readFileSync(htmlFilePath, 'utf-8').toString();
        const template = handlebars.compile(source);

        // 2. Prepare replacements
        const replacements = {
            subject: subject,
            from: process.env.EMAIL_HOST_USER,
            name: to,
            action_url: action_url,
            date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            html: html,
            company_name: process.env.EMAIL_COMPANY_NAME,
            company_address: process.env.EMAIL_COMPANY_ADDRESS,
            company_phone: process.env.EMAIL_COMPANY_PHONE,
            company_email: process.env.EMAIL_HOST_USER,
            company_logo: process.env.EMAIL_COMPANY_LOGO,
            years: new Date().getFullYear()
        };

        // 3. Generate HTML
        const htmlToSend = template(replacements);

        // 4. Configure transporter
        const mailConfig = {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_USE_SSL === 'true',
            auth: {
                user: process.env.EMAIL_HOST_USER,
                pass: process.env.EMAIL_HOST_PASSWORD
            }
        };

        const transporter = nodemailer.createTransport(smtpTransport(mailConfig));

        // 5. Prepare mail options
        const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to,
            subject,
            html: htmlToSend
        };

        // 6. Send mail
        const info = await transporter.sendMail(mailOptions);

        if (!info.response) {
            throw new Error('Email tidak dapat dikirim : ' + info.message);
        }


        return {
            status: true,
            message: `${subject} telah dikirim ke ${to}`,
            info: info.response
        };

    } catch (error) {
        return {
            status: false,
            message: 'Email tidak dapat dikirim : ' + error.message,
            error: error
        };
    }
};

module.exports = sendMail;
