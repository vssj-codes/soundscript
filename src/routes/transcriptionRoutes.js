const express = require("express");
const router = express.Router();

const Transcription = require("../models/Transcription");
const isAudioUrlValid = require("../utils/validateAudioUrl");

router.post("/", async (req, res) => {
  const { audioUrl } = req.body;

  if (!isAudioUrlValid(audioUrl)) {
    return res.status(400).json({ error: "Valid audio file URL is required" });
  }

  try {
    const transcription = await Transcription.create({ audioUrl });

    setTimeout(async () => {
      transcription.status = "completed";

      transcription.text = `Mock transcription for ${audioUrl}`;
      await transcription.save();
    }, 3000);

    res.status(201).json({
      id: transcription._id,
      audioUrl: transcription.audioUrl,
      status: transcription.status,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Transcription for this URL already exists." });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
