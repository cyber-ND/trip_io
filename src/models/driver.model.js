const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vehicle: {
      make: {
        type: String,
        required: [true, "Vehicle make is required"],
      },
      model: {
        type: String,
        required: [true, "Vehicle model is required"],
      },
      year: {
        type: Number,
        required: [true, "Vehicle year is required"],
      },
      plateNumber: {
        type: String,
        required: [true, "Plate number is required"],
        unique: true,
        uppercase: true,
        trim: true,
      },
      colour: {
        type: String,
        required: [true, "Vehicle colour is required"],
      },
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  },
);

driverSchema.index({ currentLocation: "2dsphere" });

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
