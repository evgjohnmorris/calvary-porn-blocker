const request = require('supertest');
const JWT_SECRET = 'test-secret-for-smoke-tests';
process.env.JWT_SECRET = JWT_SECRET;
const app = require('../server');
const jwt = require('jsonwebtoken');


// Mock system/scanner.js to avoid intensive operations during testing
jest.mock('../system/scanner', () => ({
  runSystemScan: jest.fn().mockResolvedValue([{ flag: 'Mock Flag', severity: 'high' }]),
  deleteSuspiciousFiles: jest.fn().mockResolvedValue({ message: 'Files deleted' }),
  clearBrowserHistory: jest.fn().mockResolvedValue({ message: 'History cleared' }),
  cancelMemberships: jest.fn().mockResolvedValue({ message: 'Memberships cancelled' })
}));

describe('Calvary Blocker Smoke Tests', () => {
  it('should report setup status successfully', async () => {
    const res = await request(app).get('/api/setup/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isSetup');
  });

  it('should reject unauthenticated access to /api/settings', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toBe(401);
  });

  it('should prevent login with bad credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'fake', password: 'bad' });
    expect([400, 401]).toContain(res.statusCode);
  });

  describe('Authenticated API & Ministry Mode', () => {
    let token;

    beforeAll(() => {
      token = jwt.sign({ role: 'ally', username: 'admin' }, JWT_SECRET, { expiresIn: '15m' });
    });

    it('should allow fetching settings when authenticated', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('filterLevel');
    });

    it('should reject local overrides when ministry_mode is enabled', async () => {
      // First, enable ministry mode
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ ministry_mode: true });
      
      // Attempt to change a managed setting
      const res = await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ filterLevel: 'off' });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/managed by your organization/i);
      
      // Cleanup: disable ministry mode
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ ministry_mode: false });
    });

    it('should update general settings successfully', async () => {
      const res = await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          personalization: { theme: 'light', accentColor: '#ff0000' },
          network: { dnsPrimary: '1.1.1.1', dnsSecondary: '1.0.0.1' },
          blockedApps: ['TestApp.exe']
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings.personalization.theme).toBe('light');
      expect(res.body.settings.network.dnsPrimary).toBe('1.1.1.1');
      expect(res.body.settings.blockedApps).toContain('TestApp.exe');
    });

    it('should force strict mode when lockdownMode is enabled', async () => {
      const res = await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ lockdownMode: true });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings.lockdownMode).toBe(true);
      expect(res.body.settings.filterLevel).toBe('strict'); // Must be forced to strict

      // Cleanup: disable lockdown mode
      await request(app)
        .post('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ lockdownMode: false });
    });

    it('should initialize scanner correctly without running actual intensive scans', async () => {
      const res = await request(app)
        .get('/api/scan')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results[0].flag).toBe('Mock Flag');
    });
  });
});
