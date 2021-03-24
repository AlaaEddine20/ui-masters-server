const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("./schema");
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

router.post("/register", async (req, res, next) => {
  try {
    const { name, lastname, email, password } = req.body;

    const userExists = await UserModel.findOne({ email }).select("-password");

    if (userExists) return res.status(401).send("User already exists!");

    const newUser = new UserModel({
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

    const user = await await UserModel.findOne({ email });

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

router.post("/logout", authorize, async (req, res, next) => {
  try {
    // res.clearCookie("", { path: "/refreshToken" });
    return res.json({ msg: "Logged out" });
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
      const image = req.file.path;

      const user = await UserModel.findByIdAndUpdate(req.params.userId, image, {
        runValidators: true,
        new: true,
      });

      if (user) {
        res.status(201).send(image);
      } else {
        const err = new Error(
          `User with id ${req.params.userId} doesn't exist`
        );
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
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
    const users = await UserModel.find().select("-password", "-token");
    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", authorize, async (req, res, next) => {
  try {
    const userById = await UserModel.findById(req.params.id);
    res.send(userById);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", authorize, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);

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
