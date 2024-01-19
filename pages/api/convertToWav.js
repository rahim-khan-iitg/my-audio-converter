// pages/api/convertToWav.js

import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

      let base64Audio  = await req.body.audio;
    //Save base64 audio to a temporary file
    
    const tempFileName = 'tempInput.ogg'; // Assuming the input is in MP3 format
    fs.writeFileSync(tempFileName, Buffer.from(base64Audio, 'base64'));

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
    
    res.status(200).json({"out":base64Wav});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
