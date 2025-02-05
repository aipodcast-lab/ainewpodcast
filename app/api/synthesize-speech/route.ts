import { NextResponse } from "next/server";
import { TextToSpeechOptions } from "@/types/speech";
import { GoogleAuth } from "google-auth-library";
import { config } from "@/lib/config";
import AWS from "aws-sdk";
import { ElevenLabsClient } from "elevenlabs";
import { spawn } from "child_process";

const GOOGLE_CLOUD_API_ENDPOINT =
  "https://texttospeech.googleapis.com/v1/text:synthesize";

export const dynamic = "force-dynamic";

function generatePodcastScript(conversation: string) {
  const lines = conversation
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const script: { text: string; host: string }[] = [];
  let currentHost = "";

  const regex = /\*\*(male|female)[12]:?\*\*:?\s*/;

  // Debugging: Log the lines before processing
  console.log("regex:", regex);
  console.log("Lines:", lines);

  lines.forEach((line: string) => {
    const speakerMatch = line.match(regex);

    if (speakerMatch) {
      const host = speakerMatch[0].replace(/\*\*/g, "").replace(":", "").trim(); // Remove the asterisks and colon
      const text = line.replace(regex, "").trim(); // Remove the speaker label

      // Debugging: Log each parsed line
      console.log("Parsed Host:", host);
      console.log("Parsed Text:", text);

      // Push the parsed line into the script array
      script.push({ text, host });

      // Update currentHost to the current speaker
      currentHost = host;
    } else if (currentHost) {
      // If the line isn't a host label, continue with the last host
      script.push({ text: line, host: currentHost });
    }
  });

  return script;
}

function generatePodcastScripSSML(
  conversation: string,
  speakers: { name: string; voice: string; gender: "male" | "female" }[]
) {
  const lines = conversation
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  let script: string = "<speak>";
  let currentHost = "";
  let regexMatchs = "";
  const sLen = speakers.length;

  const speakerVoiceMap: { [key: string]: string } = {};

  for (let i = 0; i < sLen; i++) {
    const slug = speakers[i].name.replace(/\s/g, "").toLowerCase();
    speakerVoiceMap[slug] = speakers[i].voice;
    if (i == sLen - 1) {
      regexMatchs += `${slug}`;
    } else {
      regexMatchs += `${slug}|`;
    }
  }

  const regexSSML = new RegExp(`\\*\\*(${regexMatchs}):?\\*\\*:?\\s*`);

  lines.forEach((line: string) => {
    const speakerMatch = line.match(regexSSML);

    if (speakerMatch) {
      // If a new speaker is detected, set the currentHost to the matched speaker
      currentHost = speakerMatch[1].toLowerCase(); // Get speaker name
      const text = line.replace(regexSSML, "").trim(); // Remove the speaker label

      script += `<voice name="${speakerVoiceMap[currentHost]}">${text}</voice>`;
    } else if (currentHost) {
      // If there's no new speaker match, but a currentHost exists,
      // this line should belong to the previous speaker.
      // Ensure content like lists or multi-line blocks are included
      script += `<voice name="${
        speakerVoiceMap[currentHost]
      }">${line.trim()}</voice>`;
    }
  });

  script += "</speak>";

  // Debugging: Log the final script before returning
  console.log("Generated Script:", script);

  return script;
}

function generateScriptForPolly(
  conversation: string,
  speakers: { name: string; voice: string; gender: "male" | "female" }[]
) {
  const lines = conversation
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const script: { text: string; voice: string }[] = [];
  let currentHost = "";
  let regexMatchs = "";
  const sLen = speakers.length;

  const speakerVoiceMap: { [key: string]: string } = {};

  for (let i = 0; i < sLen; i++) {
    const slug = speakers[i].name.replace(/\s/g, "").toLowerCase();
    speakerVoiceMap[slug] = speakers[i].voice;
    if (i == sLen - 1) {
      regexMatchs += `${slug}`;
    } else {
      regexMatchs += `${slug}|`;
    }
  }

  const regexSSML = new RegExp(`\\*\\*(${regexMatchs}):?\\*\\*:?\\s*`);
  lines.forEach((line: string) => {
    const speakerMatch = line.match(regexSSML);
    console.log("Speaker Match:", speakerMatch);
    if (speakerMatch) {
      currentHost = speakerMatch[1].toLowerCase(); // Get speaker name
      const text = line.replace(regexSSML, "").trim();

      script.push({ text, voice: speakerVoiceMap[currentHost] });
    } else if (currentHost) {
      script.push({ text: line.trim(), voice: speakerVoiceMap[currentHost] });
    }
  });
  return script;
}

async function synthesizeWithPolly(
  options: TextToSpeechOptions
): Promise<{ audioContent: string; duration: number }> {
  const polly = new AWS.Polly({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY || "",
      secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
  });

  const client = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
  });

  const script = generateScriptForPolly(
    options.text.trim(),
    options.speakers || []
  );

  console.log("Polly Script:", script);
  const audioBuffers: Buffer[] = []; // Array to store audio buffers

  for (const { text, voice } of script) {
    if (voice === "elevenlab") {
      try {
        const response = await client.textToSpeech.convert(options.voice, {
          output_format: "mp3_44100_128", // Use standard MP3 format
          text: text,
          model_id: "eleven_multilingual_v2",
        });

        console.log("Eleven Labs Response:", response);

        if (!response)
          throw new Error("No readable stream found in Eleven Labs response");

        // Collect Eleven Labs audio buffer
        const audioChunks: Uint8Array[] = [];
        for await (const chunk of response) {
          audioChunks.push(chunk);
        }

        // Concatenate all chunks into one buffer
        const audioBuffer = Buffer.concat(audioChunks);
        const convertedBuffer = await convertToCompatibleFormat(audioBuffer);
        audioBuffers.push(convertedBuffer); // Store converted buffer for merging
      } catch (error) {
        console.error("Error while processing Eleven Labs response:", error);
        throw error;
      }
    } else {
      const params = {
        OutputFormat: "mp3",
        Text: text,
        VoiceId: voice,
        Engine: "generative",
      };

      const response = await polly.synthesizeSpeech(params).promise();
      console.log("Polly Response:", response);

      if (response.AudioStream instanceof Buffer) {
        // Collect Polly audio buffer
        const convertedBuffer = await convertToCompatibleFormat(
          response.AudioStream
        );
        audioBuffers.push(convertedBuffer); // Store converted buffer for merging
      }
    }
  }

  // Merge all audio buffers
  // Merge all audio buffers by simply concatenating them
  const mergedBuffer = Buffer.concat(audioBuffers);

  // Convert the merged buffer to base64
  const audioContent = mergedBuffer.toString("base64");
  const duration = Math.ceil(mergedBuffer.length / 32000); // Calculate duration based on size

  return { audioContent, duration };
}

async function convertToCompatibleFormat(inputBuffer: Buffer): Promise<Buffer> {
  console.log("Converting buffer to compatible format...");
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      "-f",
      "mp3",
      "-i",
      "pipe:0", // Read from stdin (inputBuffer)
      "-ar",
      "44100", // Set sample rate to 44100 Hz
      "-ac",
      "2", // Stereo audio (2 channels)
      "-ab",
      "128k", // Set bitrate to 128 kbps
      "-f",
      "mp3", // Force MP3 format
      "pipe:1", // Output to stdout (buffer)
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    const inputStream = ffmpeg.stdin;
    inputStream.write(inputBuffer);
    inputStream.end();

    const outputChunks: Uint8Array[] = [];
    ffmpeg.stdout.on("data", (chunk) => outputChunks.push(chunk));

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(outputChunks)); // Return the converted buffer
      } else {
        reject(new Error(`ffmpeg failed with code ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

export async function POST(request: Request) {
  try {
    const { clientEmail, privateKey, apiKey } = config.google;

    if (!clientEmail || !privateKey || !apiKey) {
      return NextResponse.json(
        { error: "Google Cloud credentials not properly configured" },
        { status: 500 }
      );
    }

    let options: TextToSpeechOptions;
    try {
      const body = await request.json();
      options = body as TextToSpeechOptions;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!options.text?.trim()) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    const input: {
      multiSpeakerMarkup?: {
        turns?: {
          text?: string;
          speaker?: string;
        }[];
      };
      ssml?: string;
      text?: string;
    } = {};

    let voice = "en-US-Studio-MultiSpeaker";
    if (options.speakers && options.speakers.length > 0) {
      if (options.useAwsVoice) {
        const result = await synthesizeWithPolly(options);

        return NextResponse.json(result);
      }

      const ssml = generatePodcastScripSSML(
        options.text?.trim(),
        options.speakers
      );
      console.log("SSML:", ssml);
      input.ssml = ssml;
      voice = "en-US-Neural2-A";
    } else {
      const script = generatePodcastScript(options.text?.trim());

      // Multi-speaker dialogue configuration
      const dialogue = script.map(({ text, host }) => {
        let hostName = "S";
        if (host === "male1") {
          hostName = "S";
        } else if (host === "female1") {
          hostName = "R";
        } else if (host === "male2") {
          hostName = "S";
        } else if (host === "female2") {
          hostName = "R";
        }

        return {
          text,
          speaker: hostName,
        };
      });

      const turns = dialogue.map(({ text, speaker }) => ({
        text,
        speaker,
      }));
      input.multiSpeakerMarkup = {
        turns,
      };
    }

    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
        project_id: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || "",
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    const response = await fetch(GOOGLE_CLOUD_API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input,
        voice: {
          languageCode: "en-US",
          name: voice, // Multi-speaker voice
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Cloud API error:", error);
      return NextResponse.json(
        { error: error.error?.message || "Speech synthesis failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.audioContent) {
      return NextResponse.json(
        { error: "No audio content received from Google Cloud" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audioContent: data.audioContent,
      duration: Math.ceil(
        Buffer.from(data.audioContent, "base64").length / 32000
      ),
    });
  } catch (error) {
    console.error("Speech synthesis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to synthesize speech",
      },
      { status: 500 }
    );
  }
}
