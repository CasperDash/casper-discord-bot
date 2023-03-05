import mongoose from "mongoose";

const EntryModel = mongoose.model(
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
    },
    {
      timestamps: true,
    }
  )
);

export default EntryModel;
