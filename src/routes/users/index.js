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
    return res.status(500).json({ msg: err.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) return res.status(401).send("You must register first!");

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH, {
      expiresIn: "30d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/refreshToken",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    res.json({
      msg: "Logged in",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
    return res.status(500).json({ msg: err.message });
  }
});

router.post("/refreshToken", async (req, res, next) => {
  try {
    const oldRefreshToken = req.body.oldRefreshToken;
    const decodedRefresh = await jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH
    );
    if (decodedRefresh) {
      const user = await UserModel.findById(decodedRefresh._id);
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== oldRefreshToken
      );

      const accessToken = await jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15 mins" }
      );

      const refreshToken = await jwt.sign(
        { _id: user._id },
        process.env.JWT_REFRESH,
        { expiresIn: "1 week" }
      );

      user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
      await user.save();

      res.send({ refreshToken, accessToken });
    } else {
      const err = new Error("error in refresh");
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/logout", authorize, async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", { path: "/refreshToken" });
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
