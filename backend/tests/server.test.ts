import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
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
    response.body.forEach((hero: any) => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero matching the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 1, name: 'A-Bomb' });
    expect(response.body).toHaveProperty('image');
    expect(response.body).toHaveProperty('powerstats');
  });

  it('should return 404 for a superhero id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999');
    expect(response.status).toBe(404);
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero matching the given id', async () => {
    const response = await request(app).get('/api/superheroes/1/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 38,
      strength: 100,
      speed: 17,
      durability: 80,
      power: 24,
      combat: 64,
    });
  });

  describe('GET /api/activity', () => {
    it('returns completed non-activity requests and excludes itself', async () => {
      await request(app).get('/api/superheroes');

      const firstActivityResponse = await request(app).get('/api/activity');
      const secondActivityResponse = await request(app).get('/api/activity');

      expect(firstActivityResponse.status).toBe(200);
      expect(Array.isArray(firstActivityResponse.body)).toBe(true);
      expect(secondActivityResponse.body).toHaveLength(firstActivityResponse.body.length);

      const superheroRequest = firstActivityResponse.body.find(
        (entry: { path: string }) => entry.path === '/api/superheroes',
      );
      expect(superheroRequest).toEqual(expect.objectContaining({
        id: expect.any(String),
        method: 'GET',
        path: '/api/superheroes',
        timestamp: expect.any(String),
        status: 200,
      }));
      expect(Number.isNaN(Date.parse(superheroRequest.timestamp))).toBe(false);
    });

    it('filters requests by path substring', async () => {
      await request(app).get('/api/superheroes');
      await request(app).get('/');

      const response = await request(app).get('/api/activity?path=/api/superheroes');

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: '/api/superheroes' }),
      ]));
      expect(response.body.every((entry: { path: string }) => (
        entry.path.includes('/api/superheroes')
      ))).toBe(true);
    });
  });

  it('should return 404 for a superhero id that does not exist', async () => {
    const response = await request(app).get('/api/superheroes/999999/powerstats');
    expect(response.status).toBe(404);
  });
});