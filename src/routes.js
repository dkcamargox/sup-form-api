const express = require("express");
const routes = express.Router();
const { getUsers, logIn, getUsersBySucursal } = require("./controllers/usersController");
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
const {
  getSurveyData, 
  getCoachingData, 
  getProductsSurveyData,
  getCoachingHistoryBySellerId,
  getCoachingDataById
} = require("./controllers/statisticsController");

routes.get("/users", getUsers);
routes.get("/users/:sucursal", getUsersBySucursal);
routes.get("/sellers/:sucursal/:supervisor", getSellers);
routes.get("/routes/:sucursal/:seller_id", getRoutes);
routes.post("/survey", postSurvey);
routes.post("/pre-coaching", postPreCoaching);
routes.post("/post-coaching", postPostCoaching);
routes.post("/coaching", postCoaching);
routes.post("/login", logIn);
routes.get("/products/:sucursal", getProductsById);
routes.put("/update-sheets", updateProducts);
routes.get("/survey-data/:sucursal", getSurveyData);
routes.get("/survey-data/products/:sucursal", getProductsSurveyData);
routes.get("/coaching-data/:sucursal", getCoachingData);
routes.get("/coaching-history/:sucursal/:sellerId", getCoachingHistoryBySellerId);
routes.get("/coaching-history/:sucursal/:sellerId/:coachingId", getCoachingDataById);

module.exports = routes;
