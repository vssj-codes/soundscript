export default async function downloadAudio(
  url: string,
  retries: number = 3,
  delay: number = 1000
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (Math.random() < 0.5) {
        console.log("Download successful!");
        return `Downloaded audio from ${url}`;
      }
      throw new Error("Download failed");
    } catch (err) {
      if (attempt === retries) {
        throw new Error(`Download failed after ${retries} attempts`);
      }
      console.log(`Retrying download... attempt ${attempt}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return `Downloaded audio from ${url}`;
}
