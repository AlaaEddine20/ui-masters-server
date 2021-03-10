const { Schema, model, Mongoose } = require("mongoose");

const PostModel = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = model("Posts", PostModel);
