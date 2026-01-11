import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import fs from "fs";
import { play } from "@elevenlabs/elevenlabs-js";
import 'dotenv/config';

const client = new ElevenLabsClient();

async function ultraFastDub(filePath) {
  try {
    const startTime = Date.now();
    console.log("Initiating Ultra-Fast Dub...");

    // 1. FAST TRANSCRIPTION (~1-2 seconds for short clips)
    const transcription = await client.speechToText.convert({
      file: fs.createReadStream(filePath),
      modelId: "scribe_v2", // Scribe v2 is optimized for speed
    });
    const englishText = transcription.text;
    console.log(`📝 Detected English: "${englishText}"`);

    // 2. TRANSLATION (Placeholder)
    // For production, call a fast LLM API here. 
    // For this test, let's assume a direct translation:
    const chineseText = "你好，这是使用快速模型生成的翻译。"; 

    // 3. FLASH TTS WITH STREAMING (Under 1 second)
    console.log("Generating Flash Audio...");
    const audioStream = await client.textToSpeech.convert("bhJUNIXWQQ94l8eI2VUf", {
      output_format: "mp3_44100_128",
      model_id: "eleven_flash_v2_5", // The fastest model available (~75ms)
      text: chineseText,
      stream: true, // Crucial: Starts playback immediately
    });

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Ready to play in ${totalTime}s!`);

    await play(audioStream);

  } catch (error) {
    console.error("Speed Error:", error.message);
  }
}

ultraFastDub("englishTestAudio.mp3");
