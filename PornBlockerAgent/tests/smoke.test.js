const request = require('supertest');
const JWT_SECRET = 'test-secret-for-smoke-tests';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';
const app = require('../server');
const jwt = require('jsonwebtoken');

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../system/scanner', () => ({
  runSystemScan: jest.fn().mockResolvedValue([{ flag: 'Mock Flag', severity: 'high' }]),
  deleteSuspiciousFiles: jest.fn().mockResolvedValue({ message: 'Files deleted' }),
  clearBrowserHistory: jest.fn().mockResolvedValue({ message: 'History cleared' }),
  cancelMemberships: jest.fn().mockResolvedValue({ message: 'Memberships cancelled' }),
  startProcessMonitoring: jest.fn()
}));

jest.mock('../system/dns', () => ({
  applyFilter: jest.fn().mockResolvedValue(true),
  applyDoHBlock: jest.fn().mockResolvedValue(true),
  removeDoHBlock: jest.fn().mockResolvedValue(true),
  verifyDNS: jest.fn().mockResolvedValue(true)
}));

// Shared token factory
function makeToken(role = 'ally') {
  return jwt.sign({ role, username: 'admin' }, JWT_SECRET, { expiresIn: '15m' });
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Calvary Blocker — Core Smoke Tests', () => {

  it('GET /api/setup/status → reports setup state', async () => {
    const res = await request(app).get('/api/setup/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isSetup');
  });

  it('GET /api/settings → 401 without token', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/login → 401 with bad credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'fake', password: 'bad' });
    expect([400, 401]).toContain(res.statusCode);
  });

  it('POST /api/account/reset-password → 400 with no newPassword', async () => {
    const res = await request(app)
      .post('/api/account/reset-password')
      .send({ recoveryKey: 'AAAA-BBBB-CCCC-DDDD' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/account/reset-password → 401 with wrong recovery key', async () => {
    const res = await request(app)
      .post('/api/account/reset-password')
      .send({ recoveryKey: 'XXXX-XXXX-XXXX-XXXX', newPassword: 'test1234' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Calvary Blocker — Ally Mode', () => {
  let token;

  beforeAll(() => { token = makeToken('ally'); });

  it('GET /api/settings → returns settings with filterLevel', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('filterLevel');
  });

  it('GET /api/account/profile → returns username and name fields', async () => {
    const res = await request(app)
      .get('/api/account/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  it('GET /api/logs → returns audit log array', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  it('POST /api/settings accountability → persists partner list', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ accountability: { enabled: true, partners: ['partner@church.org'] } });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.accountability.enabled).toBe(true);
    expect(res.body.settings.accountability.partners).toContain('partner@church.org');
  });

  it('GET /api/settings → confirms accountability partner persisted', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.accountability.enabled).toBe(true);
    expect(res.body.accountability.partners).toContain('partner@church.org');
  });

  it('POST /api/settings personalization → theme and accent update', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ personalization: { theme: 'dark', accentColor: '#4f46e5' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.personalization.theme).toBe('dark');
  });

  it('POST /api/settings blockedApps → list persists', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ blockedApps: ['TestApp.exe', 'AnotherApp.exe'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.blockedApps).toContain('TestApp.exe');
    expect(res.body.settings.blockedApps).toContain('AnotherApp.exe');
  });

  it('POST /api/settings network → DNS fields persist', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ network: { dnsPrimary: '1.1.1.1', dnsSecondary: '1.0.0.1' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.network.dnsPrimary).toBe('1.1.1.1');
    expect(res.body.settings.network.dnsSecondary).toBe('1.0.0.1');
  });

  it('GET /api/scan → returns mock scan results', async () => {
    const res = await request(app)
      .get('/api/scan')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results[0].flag).toBe('Mock Flag');
  });

  it('POST /api/scan/remediate → 200', async () => {
    const res = await request(app)
      .post('/api/scan/remediate')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/scan/delete_history → 200', async () => {
    const res = await request(app)
      .post('/api/scan/delete_history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/scan/cancel_memberships → 200 with links array', async () => {
    const res = await request(app)
      .post('/api/scan/cancel_memberships')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.links)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Calvary Blocker — Family Mode', () => {
  let token;

  beforeAll(() => { token = makeToken('ally'); });

  afterAll(async () => {
    // Always reset family mode after suite
    await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ family_mode: false, filterLevel: 'strict' });
  });

  it('POST /api/settings → enables family_mode and sets filterLevel to strict', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ family_mode: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.family_mode).toBe(true);
    // If it was below strict it should have been elevated
    expect(['strict', 'family']).toContain(res.body.settings.filterLevel);
  });

  it('POST /api/settings → blocks filterLevel: "off" in family mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'off' });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/family mode/i);
  });

  it('POST /api/settings → blocks filterLevel: "moderate" in family mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'moderate' });
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/family mode/i);
  });

  it('POST /api/settings → allows filterLevel: "strict" in family mode → 200', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'strict' });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.filterLevel).toBe('strict');
  });

  it('POST /api/settings → allows personalization changes in family mode → 200', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ personalization: { theme: 'light', accentColor: '#ff0000' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.personalization.theme).toBe('light');
  });

  it('POST /api/settings → allows blockedApps changes in family mode → 200', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ blockedApps: ['FamilyBlockedApp.exe'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.blockedApps).toContain('FamilyBlockedApp.exe');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Calvary Blocker — Ministry Mode', () => {
  let token;

  beforeAll(() => { token = makeToken('ally'); });

  afterAll(async () => {
    await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ ministry_mode: false });
  });

  it('POST /api/settings → enables ministry_mode → 200', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ ministry_mode: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.ministry_mode).toBe(true);
  });

  it('POST /api/settings → blocks filterLevel change in ministry mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'off' });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/managed by your organization/i);
  });

  it('POST /api/settings → blocks lockdownMode change in ministry mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ lockdownMode: false });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/managed by your organization/i);
  });

  it('POST /api/settings → blocks network change in ministry mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ network: { dnsPrimary: '8.8.8.8', dnsSecondary: '8.8.4.4' } });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/managed by your organization/i);
  });

  it('POST /api/settings → blocks vpn change in ministry mode → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ vpn: { hostname: 'vpn.example.com', hub: 'HUB1', port: '443' } });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/managed by your organization/i);
  });

  it('POST /api/settings → allows personalization change in ministry mode → 200', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ personalization: { theme: 'dark', accentColor: '#7c3aed' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.personalization.accentColor).toBe('#7c3aed');
  });

  it('POST /api/settings → sets remote_policy_url in ministry mode → persists', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ remote_policy_url: 'https://policy.calvary.church/policy.json' });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.remote_policy_url).toBe('https://policy.calvary.church/policy.json');
  });

  it('POST /api/settings → disabling ministry_mode restores editability → 200', async () => {
    await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ ministry_mode: false });

    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'strict' });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.filterLevel).toBe('strict');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Calvary Blocker — Lockdown Escalation Scenario', () => {
  let token;

  beforeAll(() => { token = makeToken('ally'); });

  afterAll(async () => {
    await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ lockdownMode: false });
  });

  it('activating lockdown forces filterLevel to strict', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ lockdownMode: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.lockdownMode).toBe(true);
    expect(res.body.settings.filterLevel).toBe('strict');
  });

  it('cannot change filterLevel to moderate while locked down → 403', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'moderate' });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/managed by your organization/i);
  });

  it('lifting lockdown allows settings changes again', async () => {
    await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ lockdownMode: false });

    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ filterLevel: 'strict' });
    expect(res.statusCode).toBe(200);
    expect(res.body.settings.filterLevel).toBe('strict');
  });
});
