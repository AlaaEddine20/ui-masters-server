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

    const user = await UserModel.findOne({ email }).select("-password");

    if (user) return res.status(401).send("User already exists!");

    const newUser = new UserModel({
      name,
      lastname,
      email,
      password,
    });

    const salt = await bcryptjs.genSalt(10);

    const hashedPass = await bcryptjs.hash(password, salt);

    newUser.password = hashedPass;

    await newUser.save();

    res.send("Registered successfully!!");
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByCredentials(email, password);

    if (!user) return res.status(401).send("You must register first!");

    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.tokens = user.tokens.concat({ token: accessToken });
    await user.save();

    res.send({ accessToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/:userId/upload",
  cloudMulter.single("image"),
  async (req, res, next) => {
    try {
      const image = { profilePic: req.file.path };
      const profilePic = await UserModel.findByIdAndUpdate(
        req.params.userId,
        image,
        {
          runValidators: true,
          new: true,
        }
      );

      if (profilePic) {
        res.status(201).send("image uploaded");
      } else {
        const err = new Error(
          `User with id ${req.params.userId} doesn't exist`
        );
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/me", authorize, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/all", authorize, async (req, res, next) => {
  try {
    const users = await UserModel.find().select("-password");
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
