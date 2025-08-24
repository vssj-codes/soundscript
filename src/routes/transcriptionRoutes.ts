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

    setTimeout(async () => {
      try {
        transcription.status = "processing";
        await transcription.save();

        const audioFile = await downloadAudio(audioUrl, 3, 1000);

        transcription.status = "completed";
        transcription.text = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?\n(${audioFile})`;
        await transcription.save();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        transcription.status = "failed";
        transcription.text = msg;
        await transcription.save();
      }
    }, 5000);

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
// TODO _req
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
