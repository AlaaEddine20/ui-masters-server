const express = require("express");
const { join } = require("path");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const connectToDB = require("./config/connectToDb");

// ROUTER
const userRouter = require("./routes/users/index");

// SERVER
const server = express();

// MONGO DB CONNECTION
connectToDB();

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json());
server.use(cors());

// ROUTES
server.use("/users", userRouter);

console.log(listEndpoints(server));

// PORT
const port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server is running on port: ", port));
