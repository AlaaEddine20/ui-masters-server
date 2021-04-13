const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSchema = require("./schema");
const Posts = require("../posts/schema");
const { authorize } = require("../../middlewares/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../utils/cloudinary");

// cloud storage
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ui-masters-users",
  },
});

const cloudMulter = multer({ storage: cloudStorage });
const router = express.Router();

const server = express();

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, lastname, email, password } = req.body;

    const userExists = await UserSchema.findOne({ email }).select("-password");

    if (userExists) return res.status(401).send("User already exists!");

    const newUser = new UserSchema({
      name,
      lastname,
      email,
      password,
    });

    await newUser.save();

    res.json({
      success: true,
      newUser,
    });
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        error: "Password must contain more than 6 characters",
      });

    const user = await UserSchema.findOne({ email });

    if (!user) return res.status(401).json({ msg: "You must register first!" });

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.tokens = user.tokens.concat({ token: accessToken });
    await user.save();

    res.json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/logout", async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.headers.authorization.split(" ")[1],
    );

    await req.user.save();
    res.json({ success: true, msg: "Logged out" });
  } catch (error) {
    next(error);
    return res.status(500).json({ msg: err.message });
  }
});

router.post(
  "/:userId/upload",
  cloudMulter.single("image"),
  async (req, res, next) => {
    try {
      const image = { profilePic: req.file.path };

      const user = await UserSchema.findByIdAndUpdate(
        req.params.userId,
        image,
        {
          runValidators: true,
          new: true,
        },
      );

      if (user) {
        res.status(201).send(image);
      } else {
        const err = new Error(
          `User with id ${req.params.userId} doesn't exist`,
        );
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  },
);

router.get("/me", authorize, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/all", authorize, async (req, res, next) => {
  try {
    const users = await UserSchema.find().select("-password, -token");
    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userById = await UserSchema.findById(req.params.id);
    const posts = await Posts.find({ user: req.params.id });
    res.send({ user: userById, posts });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", authorize, async (req, res, next) => {
  try {
    const user = await (await UserSchema.findById(req.params.id)).populate(
      "posts",
    );

    if (!user) return res.status(404).send("User not found");

    res.user = user;

    const updatedUser = await res.user.set(req.body);

    await updatedUser.save();

    res.send("Updated");
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = router;
