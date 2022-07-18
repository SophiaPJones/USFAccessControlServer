// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./routes/route');
app.use(express.urlencoded({extended: false}))
import { Sequelize, Model, DataTypes } from 'sequelize';

const app = express();
app.use(express.json())
app.use('/user',userRoute)
app.use(bodyParser.json());
app.listen(3001, () => {
console.log('listening on port 3001');
});