const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;


// ===============================
// 🔐 Middleware pour vérifier un token JWT
// ===============================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie si le header Authorization est présent
  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Le token est attendu sous la forme "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Vérification du token
    const decoded = jwt.verify(token, secretKey);

    // Ajoute les infos décodées à la requête (ex : id, role)
    req.utilisateur = decoded;

    next(); // continue vers la route suivante
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

module.exports = verifyToken;
