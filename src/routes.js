const express = require("express");
const routes = express.Router();
const { getLoginData, getUsers, logIn, getUsersBySucursal } = require("./controllers/usersController");
const { getSellers, getRoutes } = require("./controllers/sellersController");
const { postSurvey } = require("./controllers/surveyController");

const {
  getProductsById,
  updateProducts
} = require("./controllers/productsController");

const {
  createContinue,
  deleteContinue,
  updateContinue,
  getContinuesBySupervisor
} = require("./controllers/continueController");

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

/**
 * INFO ROUTES
 */
routes.get("/login-data", getLoginData)
// get list of users
routes.get("/users", getUsers);
// get list of users by sucursal
routes.get("/users/:sucursal", getUsersBySucursal);
// get list of sellers by sucursal and supervisor
routes.get("/sellers/:sucursal/:supervisor", getSellers);
// get list of routes by seller and suc
routes.get("/routes/:seller_id", getRoutes);
/**
 * SURVEY FORM ROUTES
 */
// general survey form
routes.post("/survey", postSurvey);
/**
 * COACHING FORM ROUTES
 */
// pre coaching form
routes.post("/pre-coaching", postPreCoaching);
// post coaching form
routes.post("/post-coaching", postPostCoaching);
// general coaching form
routes.post("/coaching", postCoaching);
/**
 * login
 */
routes.post("/login", logIn);
/**
 * PRODUCTS ROUTES
 */
// get a list of products by sucursal
routes.get("/products/:sucursal", getProductsById);
// rebuild products
routes.put("/update-sheets", updateProducts);
/**
 * SURVEY STATISTICS ROUTES
 */
// get general survey statistics by sucursal id
routes.get("/survey-data/:sucursal", getSurveyData);
// get products surveys by sucursal
routes.get("/survey-data/products/:sucursal", getProductsSurveyData);
// coaching history and statistics routes
routes.get("/coaching-data/:sucursal", getCoachingData);
routes.get("/coaching-history/:sucursal/:sellerId", getCoachingHistoryBySellerId);
routes.get("/coaching-history/:sucursal/:sellerId/:coachingId", getCoachingDataById);

/**
 * CONTINUE ROUTES
 */

// delete data from a created route
routes.delete("/continue/:id", deleteContinue);
// update data from a created route
routes.put("/continue/:id", updateContinue);
// create a new continue route
routes.post("/continue", createContinue);
// get all continues
routes.get("/continue/:sucursal/:supervisor", getContinuesBySupervisor)

module.exports = routes;
