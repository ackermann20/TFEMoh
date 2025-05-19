const request = require('supertest');
const app = require('../app');

describe('PUT /api/boulanger/commandes/:id/statut', () => {
  it('doit mettre à jour le statut d’une commande existante', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImJvdWxhbmdlciIsImV4cCI6MTc0NzY4MTM0NSwiaWF0IjoxNzQ3Njc3NzQ1fQ.VUU65lV6IXbgoywEPCSttCRZLsFMXk8JW7ez02EfHIw'; 
    const commandeId = 14;

    const res = await request(app)
      .put(`/api/boulanger/commandes/${commandeId}/statut`)
      .send({ statut: 'en préparation' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
