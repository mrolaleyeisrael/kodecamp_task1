import http from 'http';
import fs from 'fs';
import { authenticate } from './auth.js';

const memoriesFile = 'memories.json';

function loadMemories() {
  if (fs.existsSync(memoriesFile)) {
    try {
      return JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
    } catch (error) {
      console.error("Error reading or parsing memories.json:", error);
      return [];
    }
  } else {
    fs.writeFileSync(memoriesFile, JSON.stringify([])); 
    return [];
  }
}

function saveMemories(memories) {
  try {
    fs.writeFileSync(memoriesFile, JSON.stringify(memories, null, 2));
  } catch (error) {
    console.error("Error writing to memories.json:", error);
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/memories' && req.method === 'GET') {
    authenticate(req, res, () => {
      const memories = loadMemories();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Your Memories</h1>
            <ul>
              ${memories.map(memory => `<li>${memory.id}: ${memory.content}</li>`).join('')}
            </ul>
            <form action="/memories" method="POST">
              <label for="content">New Memory:</label><br>
              <textarea id="content" name="content" rows="4" cols="50"></textarea><br>
              <input type="submit" value="Submit">
            </form>
          </body>
        </html>
      `);
    });
  } else if (req.url === '/memories' && req.method === 'POST') {
    authenticate(req, res, () => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const parsedBody = new URLSearchParams(body);
        const memoryContent = parsedBody.get('content');
        if (!memoryContent) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Memory content is required');
          return;
        }

        const memories = loadMemories();
        const newMemory = { id: memories.length + 1, content: memoryContent };
        memories.push(newMemory);
        saveMemories(memories);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newMemory));
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
