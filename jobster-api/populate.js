require("dotenv").config();

const mockData = require("./mock-data.json");
const job = require("./models/Job");
const connectDB = require("./db/connect");
const start = async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    await job.create(mockData);
    console.log("DB is populated successfully !");
    process.exit(0);
  } catch (error) {
    console.log("DB is not populated ! ");
    process.exit(1);
  }
};

start();
