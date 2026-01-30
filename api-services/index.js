require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memberRouter = require('./app/routes/member.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/api/v1', memberRouter);

app.listen(process.env.APP_PORT, () => {
    console.log('Member services listening on port ' + process.env.APP_PORT);
});