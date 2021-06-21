const express = require('express');
const routes = express.Router();
const { getUsers, logIn } = require('./controllers/usersController');

routes.get('/users', getUsers);
routes.post('/login', logIn)

module.exports = routes;