const express = require('express');
const routes = express.Router();
const { getUsers } = require('./controllers/usersController');

routes.get('/users', getUsers);

module.exports = routes;