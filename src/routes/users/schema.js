const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserModel = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
  },
  lastname: {
    type: String,
    required: true,
    minLength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  profilePic: {
    type: String,
    required: false,
  },

  // likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

UserModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserModel.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

module.exports = model("User", UserModel);
