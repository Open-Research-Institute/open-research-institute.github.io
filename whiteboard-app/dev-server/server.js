import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/api/save-tldraw-file', async (req, res) => {
  try {
    const { snapshot, filename = 'index' } = req.body;

    const filePath = path.join(process.cwd(), 'public', `${filename}.tldr`);
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Save server on :3001'));