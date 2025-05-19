const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/login', () => {
  it('doit renvoyer un token si les identifiants sont valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'LH44@F1.com', motDePasse: 'azerty' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
