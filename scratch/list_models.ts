
import { GoogleGenAI } from '@google/genai';

const geminiApiKey = "AQ.Ab8RN6IpurDcxYKzLrwqDTAMn2BHv8LZJgwvVwUQsc2Fg3mF-A";
const genAI = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function listModels() {
  try {
    const models = await genAI.models.list();
    console.log('Available models:', JSON.stringify(models, null, 2));
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
