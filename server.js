import mongoose from "mongoose";
const { connect } = mongoose;
import { config } from "dotenv";
import http from "http";
import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION!!! shutting down....");
  console.error(err.name, err.message);
  process.exit(1);
});

// Load environment variables from .env file
config({
  path: "./.env",
});

// Check if required environment variables are defined
if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.error("Environment variables DATABASE Credentials are required.");
  process.exit(1); // Exit the process with failure code
}

const server = new http.createServer(app);

const database = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect the database
connect(database, {}).then((con) => {
  console.log("DB connection Successfully!");
}).catch((err) => {
  console.error("DB connection error:", err.message);
  process.exit(1); // Exit the process with failure code
});

// Start the server
const port = process.env.PORT || 7000;
server.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});

// Listen for connection errors
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.error("Mongoose connection lost. Please check your network.");
});


// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION!!!  shutting down ...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
// Handle SIGINT (Ctrl+C) gracefully
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully.");
  mongoose.connection.close(() => {
    console.log("Mongoose connection closed.");
    process.exit(0);
  });
});

// Handle SIGTERM (e.g., Heroku dyno cycling) gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  mongoose.connection.close(() => {
    console.log("Mongoose connection closed.");
    process.exit(0);
  });
});
