import validator from "validator";

export default function isAudioUrlValid(url: string): boolean {
  if (!url || !validator.isURL(url)) {
    return false;
  }

  const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
  return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}
