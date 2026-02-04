require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memberRouter = require('./app/routes/member.js');

const app = express();
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200,
        preflightContinue: false,
        maxAge: 86400,
        exposedHeaders: ['Set-Cookie']
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('static'));

app.use('/api/v1', memberRouter);

app.listen(process.env.APP_PORT, '0.0.0.0', () => {
    console.log('Member services listening on port ' + process.env.APP_PORT);
});