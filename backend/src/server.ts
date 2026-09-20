import express from 'express';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

/**
This is a superheroes API server that supports 3 GET endpoints
The data is stored in a JSON file in the project folder called superheroes.json
1. /api/superheroes - returns a list of all superheroes, as a JSON array
2. /api/superheroes/:id - returns a specific superhero by id, as a JSON object
3. /api/superheroes/:id/powerstats - returns the powers statistics for superhero by id, as a JSON object
*/

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

interface Superhero {
  id: number;
  name: string;
  image: string;
  powerstats: Powerstats;
}

interface ActivityEntry {
  id: string;
  method: string;
  path: string;
  timestamp: string;
  status: number;
}

const activityLog: ActivityEntry[] = [];

app.use((req, res, next) => {
  if (req.path === '/api/activity') {
    next();
    return;
  }

  res.on('finish', () => {
    activityLog.push({
      id: randomUUID(),
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      status: res.statusCode,
    });
  });

  next();
});

// Root route
/**
 * GET /
 * Root endpoint for health check or welcome message.
 *
 * Response: 200 OK - Returns a welcome string.
 */
app.get('/', (req, res) => {
  res.send('Save the World!');
});

/**
 * GET /api/activity
 * Returns completed requests, optionally filtered by a path substring.
 *
 * Response: 200 OK - Array of activity entries
 */
app.get('/api/activity', (req, res) => {
  const pathQuery = typeof req.query.path === 'string' ? req.query.path : '';
  const entries = pathQuery
    ? activityLog.filter((entry) => entry.path.includes(pathQuery))
    : activityLog;

  res.json(entries);
});

// API route to fetch superheroes data
/**
 * Loads the list of superheroes from a JSON file asynchronously.
 *
 * @returns {Promise<Superhero[]>} A promise that resolves with the parsed JSON data containing superheroes,
 * or rejects if there is an error reading or parsing the file.
 * @throws Will reject the promise if the file cannot be read or if the JSON is invalid.
 */
function loadSuperheroes(): Promise<Superhero[]> {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  return new Promise((resolve, reject) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * GET /api/superheroes
 * Returns a list of all superheroes.
 *
 * Response: 200 OK - Array of superhero objects
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    res.json(superheroes);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id
 * Returns a single superhero by id.
 *
 * Response: 200 OK - Superhero object
 *           404 Not Found - If no superhero matches the id
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    const hero = superheroes.find((h) => h.id === Number(req.params.id));
    if (!hero) {
      res.status(404).send('Superhero not found');
      return;
    }
    res.json(hero);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id/powerstats
 * Returns the powerstats for a single superhero by id.
 *
 * Response: 200 OK - Powerstats object
 *           404 Not Found - If no superhero matches the id
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id/powerstats', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    const hero = superheroes.find((h) => h.id === Number(req.params.id));
    if (!hero) {
      res.status(404).send('Superhero not found');
      return;
    }
    res.json(hero.powerstats);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Failed to start server:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else if (err.code === 'EACCES') {
        console.error(`Insufficient privileges to bind to port ${PORT}.`);
      }
      process.exit(1);
    });

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    console.error('Unexpected error during server startup:', err);
    process.exit(1);
  }
}

export default app;