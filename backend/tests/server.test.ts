import request from 'supertest';
import app from '../src/server';

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return all superheroes as an array', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Check that required fields exist
    response.body.forEach(hero => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });

  it('should handle internal server error gracefully', async () => {
    // Temporarily mock loadSuperheroes to throw
    const original = app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle;
    app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = async (req, res) => {
      res.status(500).send('Internal Server Error');
    };
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(500);
    // Restore original handler
    app._router.stack.find(r => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = original;
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/2/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 100,
      strength: 18,
      speed: 23,
      durability: 28,
      power: 32,
      combat: 32
    });
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/xyz/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/compare', () => {
  it('should compare two valid superheroes and return structured result', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=2');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id1', 1);
    expect(response.body).toHaveProperty('id2', 2);
    expect(Array.isArray(response.body.categories)).toBe(true);
    const expectedOrder = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    expect(response.body.categories.map((c: any) => c.name)).toEqual(expectedOrder);
    // spot check a couple values
    const strengthCat = response.body.categories.find((c: any) => c.name === 'strength');
    expect(strengthCat.id1_value).toBe(100); // hero 1 strength
    expect(strengthCat.id2_value).toBe(18); // hero 2 strength
    expect(['tie', 1, 2]).toContain(strengthCat.winner);
  // overall winner should be tie (3 wins each)
  expect(response.body.overall_winner).toBe('tie');
  });

  it('should return error when id1 missing', async () => {
    const response = await request(app).get('/api/superheroes/compare?id2=2');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Both id1 and id2 query parameters are required', status: 'invalid_request' });
  });

  it('should return error when id2 missing', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Both id1 and id2 query parameters are required', status: 'invalid_request' });
  });

  it('should return error when ids are non-numeric', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=abc&id2=2');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'id1 and id2 must be valid numbers', status: 'invalid_request' });
  });

  it('should return error when one hero not found', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=9999');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'One or both superheroes not found', status: 'invalid_request' });
  });
});

