const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const resetTokens = {}; // Stockage temporaire des tokens de réinitialisation

require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

// Configuration de l’envoi d’e-mails via Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});


// 🔐 Connexion d’un utilisateur
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;
  console.log(' Reçu :', email, motDePasse);

  try {
    const utilisateur = await Utilisateur.findOne({ where: { email } });

    if (!utilisateur) {
      console.log('Utilisateur introuvable');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const match = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!match) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: utilisateur.id,
        role: utilisateur.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // expire dans 1h
      },
      secretKey
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        telephone: utilisateur.telephone,
        solde: utilisateur.solde
      }
    });

  } catch (error) {
    console.error('Erreur serveur', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// 🔄 Changer son mot de passe (en étant connecté)
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const utilisateur = await Utilisateur.findByPk(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, utilisateur.motDePasse);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await utilisateur.update({ motDePasse: hashedPassword });

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// ❓ Mot de passe oublié — envoie un email avec lien de réinitialisation
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await Utilisateur.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "Email non trouvé." });

  const token = crypto.randomBytes(32).toString("hex");
  resetTokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 }; // valable 15 min

  const resetLink = `http://localhost:3001/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Réinitialisation du mot de passe",
    html: `<p>Clique ici pour réinitialiser : <a href="${resetLink}">${resetLink}</a></p>`
  });

  res.json({ message: "Un lien a été envoyé par email." });
});


// 🔁 Réinitialisation du mot de passe via le lien email
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const entry = resetTokens[token];
  if (!entry || Date.now() > entry.expires) {
    return res.status(400).json({ message: "Token invalide ou expiré." });
  }

  try {
    const utilisateur = await Utilisateur.findOne({ where: { email: entry.email } });
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });

    const hashed = await bcrypt.hash(password, 10);
    utilisateur.motDePasse = hashed;
    await utilisateur.save();

    delete resetTokens[token]; // le token ne peut être réutilisé

    return res.json({ message: "Mot de passe réinitialisé avec succès." });

  } catch (err) {
    console.error("Erreur reset password :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
