const express = require("express");
const routes = express.Router();
const { getUsers, logIn } = require("./controllers/usersController");
const { getSellers, getRoutes } = require("./controllers/sellersController");

routes.get("/users", getUsers);
routes.get("/sellers/:sucursal/:supervisor", getSellers);
routes.get("/routes/:sucursal/:seller_id", getRoutes);
routes.post("/login", logIn);

module.exports = routes;
