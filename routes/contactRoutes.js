const express = require('express');
const router = express.Router();
const { contactMessage } = require('../models');


// ===============================
// 📬 Récupérer tous les messages de contact
// ===============================
router.get('/', async (req, res) => {
  try {
    const messages = await contactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Erreur récupération messages contact :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ===============================
// ✉️ Envoyer un message de contact
// ===============================
router.post('/', async (req, res) => {
  try {
    const message = await contactMessage.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    console.error("Erreur enregistrement message :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
