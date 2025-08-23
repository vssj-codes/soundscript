const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema(
  {
    audioUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["queued", "processing", "completed", "failed"],
        default: "queued",
        message: `{VALUE} is not a valid status.`,
      },
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
