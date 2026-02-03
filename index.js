require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memberRouter = require('./app/routes/member.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('static'));

app.use('/api/v1', memberRouter);

app.listen(process.env.APP_PORT, '0.0.0.0', () => {
    console.log('Member services listening on port ' + process.env.APP_PORT);
});