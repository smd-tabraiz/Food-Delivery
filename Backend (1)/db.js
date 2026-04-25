const mongoose = require("mongoose");

const connectDatabase = () => {
  if (!process.env.DB_LOCAL_URI) {
    console.warn("WARNING: DB_LOCAL_URI is not defined in your environment variables.");
    console.warn("The server will start, but database operations will fail.");
    return;
  }
  mongoose
    .connect(process.env.DB_LOCAL_URI, {
    })
    .then((con) => {
      console.log(
        `MongoDB Database connected with HOST:${con.connection.host}`
      );
    })
    .catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });
};
module.exports = connectDatabase;
