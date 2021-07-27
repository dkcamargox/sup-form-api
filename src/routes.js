const express = require("express");
const routes = express.Router();
const { getUsers, logIn } = require("./controllers/usersController");
const { getSellers, getRoutes } = require("./controllers/sellersController");
const { postSurvey } = require("./controllers/surveyController");
const {
  getProductsById,
  updateProducts
} = require("./controllers/productsController");
const {
  postPreCoaching,
  postPostCoaching,
  postCoaching
} = require("./controllers/coachingController");

routes.get("/users", getUsers);
routes.get("/sellers/:sucursal/:supervisor", getSellers);
routes.get("/routes/:sucursal/:seller_id", getRoutes);
routes.post("/survey", postSurvey);
routes.post("/pre-coaching", postPreCoaching);
routes.post("/post-coaching", postPostCoaching);
routes.post("/coaching", postCoaching);
routes.post("/login", logIn);
routes.get("/products/:sucursal", getProductsById);
routes.put("/update-sheets", updateProducts);

module.exports = routes;
