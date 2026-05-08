const mongoose = require("mongoose");
const Driver = require("./driver.model");

const ratingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      unique: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ratingSchema.post("save", async function () {
  const driver = await Driver.findOne({ userId: this.driverId });
  if (!driver) return;
  const newTotal = driver.totalRatings + 1;
  const newRating =
    (driver.rating * driver.totalRatings + this.stars) / newTotal;
  await Driver.findByIdAndUpdate(driver._id, {
    rating: newRating,
    totalRatings: newTotal,
  });
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
