
import fs from 'fs';
import fetch from 'node-fetch';

const imagePath = '/Users/emidiol/.gemini/antigravity/brain/4e3e0810-34fe-4c50-87a6-aa21de214a85/toy_doll_fail_1780938349257.png';
const base64Image = fs.readFileSync(imagePath).toString('base64');
const dataUrl = `data:image/png;base64,${base64Image}`;

async function test() {
  console.log('Sending request to /api/ai-check with doll image...');
  try {
    const res = await fetch('http://localhost:3000/api/ai-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskID: 'task-1',
        imageUrl: dataUrl
      })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
