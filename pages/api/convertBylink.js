// pages/api/convertToWav.js

import fs from 'fs';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

       let oggAudioUrl  = req.body.url;

    // Download OGG audio from the provided URL
    const response = await fetch(oggAudioUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch the OGG audio file' });
    }

    const oggArrayBuffer = await response.arrayBuffer();
    const oggBuffer = Buffer.from(oggArrayBuffer);
    // Save OGG audio to a temporary file
    const tempFileName = 'tempInput.ogg'; // Assuming the input is in OGG format
    fs.writeFileSync(tempFileName, oggBuffer);

    // Convert to WAV using ffmpeg
    const outputFileName = 'output.wav';
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempFileName)
        .audioCodec('pcm_s16le')
        .toFormat('wav')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputFileName);
    });

    // Read the converted WAV file as base64
    const wavBuffer = fs.readFileSync(outputFileName);
    const base64Wav = wavBuffer.toString('base64');

    // Clean up temporary files
    fs.unlinkSync(tempFileName);
    fs.unlinkSync(outputFileName);

    res.status(200).json({ base64Wav });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
