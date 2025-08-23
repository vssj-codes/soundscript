import { Router, Request, Response } from "express";
import Transcription from "../models/Transcription";
import isAudioUrlValid from "../utils/validateAudioUrl";
import isObjectIdValid from "../utils/validateObjectId";
import downloadAudio from "../utils/downloadAudio";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { audioUrl } = req.body as { audioUrl?: string };

  if (!audioUrl || !isAudioUrlValid(audioUrl)) {
    return res.status(400).json({ error: "Valid audio file URL is required" });
  }

  try {
    const transcription = await Transcription.create({ audioUrl });

    setImmediate(async () => {
      try {
        transcription.status = "processing";
        await transcription.save();

        const audioFile = await downloadAudio(audioUrl, 3, 1000);

        transcription.status = "completed";
        transcription.text = `Mock transcription for ${audioUrl}\n(${audioFile})`;
        await transcription.save();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        transcription.status = "failed";
        transcription.text = msg;
        await transcription.save();
      }
    });

    return res.status(201).json({
      id: transcription._id,
      audioUrl: transcription.audioUrl,
      status: transcription.status,
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res
        .status(400)
        .json({ error: "Transcription for this URL already exists." });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isObjectIdValid(id)) {
    return res.status(400).json({ error: "Invalid transcription ID" });
  }

  try {
    const transcription = await Transcription.findById(id);

    if (!transcription) {
      return res.status(404).json({ error: "Transcription not found" });
    }

    return res.json({
      id: transcription._id,
      audioUrl: transcription.audioUrl,
      status: transcription.status,
      text: transcription.text,
    });
  } catch {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const transcriptions = await Transcription.find().sort({ createdAt: -1 });

    return res.json(
      transcriptions.map((t: any) => ({
        id: t._id,
        audioUrl: t.audioUrl,
        status: t.status,
        text: t.text,
        createdAt: t.createdAt,
      }))
    );
  } catch {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
