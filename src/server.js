const express = require("express");
const { join } = require("path");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const connectToDB = require("./config/connectToDb");

// ROUTER
const userRouter = require("./routes/users/index");
const postRouter = require("./routes/posts/index");
// SERVER
const server = express();

// MONGO DB CONNECTION
connectToDB();

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json());

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(cors(corsOptions));

// ROUTES
server.use("/users", userRouter);
server.use("/posts", postRouter);
console.log(listEndpoints(server));

// PORT
const port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server is running on port: ", port));
