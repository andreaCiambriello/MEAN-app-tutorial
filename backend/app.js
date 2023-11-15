const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env'});

console.log(process.env.DATABASE_URL)

const databaseUrl = process.env.DATABASE_URL

const postsRoutes = require('./routes/posts');

const app = express();

mongoose.connect(databaseUrl)
    .then(() => {
        console.log('Connected to database!')
    })
    .catch(() => {
        console.log('Connection failed!')
    });

app.use((bodyParser.json()));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
})

app.use('/api/posts', postsRoutes);

module.exports = app;