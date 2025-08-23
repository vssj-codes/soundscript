const validator = require("validator");

function isAudioUrlValid(url) {
  if (!url || !validator.isURL(url)) {
    return false;
  }

  // allow only audio file extensions
  const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];
  return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}

module.exports = isAudioUrlValid;
