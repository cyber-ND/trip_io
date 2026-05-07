const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "ongoing",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },
    pickup: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dropoff: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    fare: {
      estimated: { type: Number },
      final: { type: Number },
    },
    distance: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    rejectionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
