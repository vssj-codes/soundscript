const express = require("express");
const router = express.Router();

const Transcription = require("../models/Transcription");
const isAudioUrlValid = require("../utils/validateAudioUrl");
const isObjectIdValid = require("../utils/validateObjectId");
const downloadAudio = require("../utils/downloadAudio");

router.post("/", async (req, res) => {
  const { audioUrl } = req.body;

  if (!isAudioUrlValid(audioUrl)) {
    return res.status(400).json({ error: "Valid audio file URL is required" });
  }

  try {
    // Create new transcription with initial "queued" status
    const transcription = await Transcription.create({ audioUrl });

    // Process asynchronously so API responds immediately
    setImmediate(async () => {
      try {
        transcription.status = "processing";
        await transcription.save();

        // Try downloading with retries
        const audioFile = await downloadAudio(audioUrl, 3, 1000);

        transcription.status = "completed";
        transcription.text = `Mock transcription for ${audioUrl}\n(${audioFile})`;
        await transcription.save();
      } catch (err) {
        transcription.status = "failed";
        transcription.text = err.message;
        await transcription.save();
      }
    });

    // Send response immediately
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

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isObjectIdValid(id)) {
    return res.status(400).json({ error: "Invalid transcription ID" });
  }

  try {
    const transcription = await Transcription.findById(id);

    if (!transcription) {
      return res.status(404).json({ error: "Transcription not found" });
    }

    res.json({
      id: transcription._id,
      audioUrl: transcription.audioUrl,
      status: transcription.status,
      text: transcription.text,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const transcriptions = await Transcription.find().sort({ createdAt: -1 });

    res.json(
      transcriptions.map((t) => ({
        id: t._id,
        audioUrl: t.audioUrl,
        status: t.status,
        text: t.text,
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
module.exports = router;
