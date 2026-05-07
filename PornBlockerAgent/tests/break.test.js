const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'placeholder-secret-change-in-prod';

// Mock system/scanner.js to avoid intensive operations during testing
jest.mock('../system/scanner', () => ({
  runSystemScan: jest.fn().mockResolvedValue([]),
  deleteSuspiciousFiles: jest.fn().mockResolvedValue({ message: 'Files deleted' }),
  clearBrowserHistory: jest.fn().mockResolvedValue({ message: 'History cleared' }),
  cancelMemberships: jest.fn().mockResolvedValue({ message: 'Memberships cancelled' }),
  startProcessMonitoring: jest.fn()
}));

jest.mock('../system/dns-server', () => ({
    startDNSServer: jest.fn()
}));

describe('Calvary Blocker Break, Bottlenecks, Loopholes, Deadends, Deadzones Tests', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ role: 'ally', username: 'admin' }, JWT_SECRET, { expiresIn: '15m' });
  });

  describe('Break Tests (Malformed data, invalid payloads)', () => {
    it('should handle malformed JSON in POST request gracefully', async () => {
      const res = await request(app)
        .post('/api/login')
        .set('Content-Type', 'application/json')
        .send('{"username": "admin", "password": "bad"'); // Missing closing brace
      expect(res.statusCode).toBe(400); // Express JSON parser should catch this
    });

    it('should reject invalid JWT tokens', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.statusCode).toBe(403);
    });

    it('should reject unauthorized access without token', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Bottlenecks (Rate Limiting)', () => {
    it('should rate limit login attempts', async () => {
      // Assuming max 5 requests per windowMs for login
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/login').send({ username: 'bad', password: 'bad' });
      }
      const res = await request(app).post('/api/login').send({ username: 'bad', password: 'bad' });
      expect(res.statusCode).toBe(429); // Too Many Requests
    });
  });

  describe('Loopholes (Bypass attempts)', () => {
    it('should not allow path traversal in static files', async () => {
      const res = await request(app).get('/../users.json');
      // Express static prevents this, should return 404 or 403 or redirect
      expect(res.statusCode).not.toBe(200);
    });

    it('should prevent setting filterLevel when lockdownMode is enabled via separate API calls', async () => {
      // Enable lockdown mode
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ lockdownMode: true });

      // Attempt to change filter level
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ filterLevel: 'off' });

      // Check settings to ensure it stayed strict
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.body.filterLevel).toBe('strict');
      
      // Turn off lockdown
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ lockdownMode: false });
    });
  });

  describe('Deadends and Deadzones (Non-existent endpoints)', () => {
    it('should return 404 for non-existent API routes', async () => {
      const res = await request(app).get('/api/this-does-not-exist');
      expect(res.statusCode).toBe(404);
    });

    it('should gracefully handle resetting password with invalid recovery key', async () => {
      const res = await request(app)
        .post('/api/account/reset-password')
        .send({ recoveryKey: 'INVALID-KEY-123', newPassword: 'newpass' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
