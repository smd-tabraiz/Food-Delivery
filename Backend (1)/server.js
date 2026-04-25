//start the server

//load env variables
//start server

//Import app
const app = require("./app")
const connectDatabase = require("./db")

//import dotenv
const dotenv = require("dotenv");

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

//Load config
dotenv.config({ path: "./config/config.env" })

//connect to database
connectDatabase();

//start the server

const server = app.listen(process.env.PORT,() =>{
    console.log(`Server is running on port ${process.env.PORT}`);
})

// Initialize socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("New client connected to socket.io:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible globally
global.io = io;

// Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down server due to Unhandled Promise rejection");
  server.close(() => process.exit(1));
});