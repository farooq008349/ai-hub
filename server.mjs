import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(__dirname, 'public')));

const client = process.env.OPENAI_API_KEY ? new OpenAI({apiKey: process.env.OPENAI_API_KEY}) : null;

const SYSTEM = `You are AI Hub, a helpful general-purpose assistant. Be useful for writing, study, coding,
business, productivity, privacy and defensive cybersecurity. Do not provide instructions that facilitate
serious wrongdoing, fraud, credential theft, malware deployment, unauthorized access, or other harmful/illegal
activity. When a request crosses that line, briefly refuse and offer a lawful, defensive or educational alternative.
Do not claim to provide professional legal or financial advice.`;

function requireClient(res){
  if(!client) return res.status(503).json({error:'AI backend is not configured. Add OPENAI_API_KEY to .env on the server.'});
  return null;
}

app.get('/api/health', (_req,res)=>res.json({ok:true, aiConfigured:!!client, payment:'pending'}));

app.post('/api/chat', async (req,res)=>{
  const missing=requireClient(res); if(missing) return;
  const message=String(req.body?.message||'').trim();
  if(!message) return res.status(400).json({error:'Message is required.'});
  try{
    const r=await client.responses.create({
      model: process.env.TEXT_MODEL || 'gpt-5.6-luna',
      instructions:SYSTEM,
      input:message
    });
    res.json({text:r.output_text});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'AI request failed.'});
  }
});

app.post('/api/image', async (req,res)=>{
  const missing=requireClient(res); if(missing) return;
  const prompt=String(req.body?.prompt||'').trim();
  if(!prompt) return res.status(400).json({error:'Prompt is required.'});
  try{
    const r=await client.images.generate({
      model: process.env.IMAGE_MODEL || 'gpt-image-2',
      prompt,
      size: process.env.IMAGE_SIZE || '1024x1024'
    });
    const b64=r.data?.[0]?.b64_json;
    if(!b64) return res.status(502).json({error:'Image provider returned no image.'});
    res.json({image:`data:image/png;base64,${b64}`});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Image generation failed.'});
  }
});

app.post('/api/video', async (req,res)=>{
  const missing=requireClient(res); if(missing) return;
  const prompt=String(req.body?.prompt||'').trim();
  if(!prompt) return res.status(400).json({error:'Prompt is required.'});
  try{
    const video=await client.videos.create({
      model:process.env.VIDEO_MODEL || 'sora-2',
      prompt,
      seconds:process.env.VIDEO_SECONDS || '4',
      size:process.env.VIDEO_SIZE || '1280x720'
    });
    res.json({id:video.id,status:video.status,progress:video.progress||0});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Video generation job failed to start.'});
  }
});

app.get('/api/video/:id', async (req,res)=>{
  const missing=requireClient(res); if(missing) return;
  try{
    const video=await client.videos.retrieve(req.params.id);
    res.json({id:video.id,status:video.status,progress:video.progress||0});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Could not retrieve video job.'});
  }
});

app.get('*', (_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(PORT,()=>console.log(`AI Hub running on http://localhost:${PORT}`));
