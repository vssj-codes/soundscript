const downloadAudio = async (url, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (Math.random() < 0.5) {
        // 50% chance of success
        console.log("Download successful!");
        return `Downloaded audio from ${url}`;
      } else {
        throw new Error("Download failed");
      }
    } catch (err) {
      if (attempt === retries) {
        throw new Error(`Download failed after ${retries} attempts`);
      }
      console.log(`Retrying download... attempt ${attempt}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = downloadAudio;
