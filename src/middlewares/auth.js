const UserSchema = require("../routes/users/schema");
const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      const user = await UserSchema.findById(decoded._id);
      req.user = user;
      next();
    } else {
      const err = new Error("unauthorized");
      // console.log(err);
      next(err);
    }
  } catch (e) {
    console.log(e);
    const err = new Error("Something went wrong");
    next(err);
  }
};

module.exports = { authorize };
