const express = require("express");
const cors = require("cors");
require("dotenv");

const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

app.use(routes);

app.listen(process.env.PORT || 8080);
console.log(`App listening to the port ${process.env.PORT || 8080}`);
