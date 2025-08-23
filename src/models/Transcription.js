const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema(
  {
    audioUrl: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ["queued", "processing", "completed", "failed"],
        message: `{VALUE} is not a valid status.`,
      },
      default: "queued",
      text: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const TranscriptionModel = mongoose.model("Transcription", TranscriptionSchema);

module.exports = TranscriptionModel;
