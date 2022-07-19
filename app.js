// importing the dependencies
const express = require('express');
//import expressPkg from 'express';
//const express = expressPkg;
const bodyParser = require('body-parser');
//import pkg from 'body-parser';
//const bodyParser = pkg;
const userRoute = require('./routes/route');

//import { Sequelize, Model, DataTypes } from 'sequelize';

const app = express();
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use('/',userRoute)
app.use(bodyParser.json());
app.listen(3001, () => {
console.log('listening on port 3001');
});