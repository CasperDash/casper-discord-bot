import mongoose from "mongoose";

export default mongoose.models.Entry ||
  mongoose.model(
    "Entry",
    new mongoose.Schema(
      {
        publicKey: {
          type: String,
          require: true,
        },
        userId: {
          type: String,
          require: true,
        },
        isHatcher: {
          type: Boolean,
          default: false,
        },
        isHammerHodler: {
          type: Boolean,
          default: false,
        },
        isWLWinner: {
          type: Boolean,
          default: false,
        },
      },
      {
        timestamps: true,
      }
    )
  );
