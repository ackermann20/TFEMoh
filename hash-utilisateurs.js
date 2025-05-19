const bcrypt = require('bcryptjs');
const { Utilisateur } = require('./models');

async function hasherTousLesMotsDePasse() {
  const utilisateurs = await Utilisateur.findAll();

  for (const user of utilisateurs) {
    // On skippe si déjà hashé
    if (!user.motDePasse.startsWith('$2a$')) {
      const hash = await bcrypt.hash(user.motDePasse, 10);
      user.motDePasse = hash;
      await user.save();
      console.log(`✅ Hashé : ${user.email}`);
    }
  }

  process.exit();
}

hasherTousLesMotsDePasse();
