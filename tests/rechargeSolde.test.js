const request = require('supertest');
const app = require('../app');

describe('PUT /api/utilisateurs/:id', () => {
  it('doit mettre à jour le solde du client', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImJvdWxhbmdlciIsImV4cCI6MTc0NzY4MTM0NSwiaWF0IjoxNzQ3Njc3NzQ1fQ.VUU65lV6IXbgoywEPCSttCRZLsFMXk8JW7ez02EfHIw';
    const userId = 2;
    
     const res = await request(app)
      .put(`/api/utilisateurs/${userId}`)
      .send({ solde: 50.00 }) // met un solde différent
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('solde');
  });
});