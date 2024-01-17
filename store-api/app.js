const express = require("express");
const app = express();

require("express-async-errors");
require("dotenv").config();

const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");

const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");

//middleware
app.use(express.json());

//products route
app.use("/api/v1/products", productsRouter);
//
app.use(notFoundMiddleware);
app.use(errorMiddleware);

//port
const port = process.env.PORT || 3000;

//
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port : ${port}`));
  } catch (error) {
    console.log(error);
  }
};
start();
