const express = require('express');
const app = express();
const etudiantRoutes = require('./routes/etudiants');
const utilisateurRoutes = require('./routes/utilisateurs');
const sequelize = require('./config/database'); // Assure-toi que ce fichier existe
const PORT = process.env.PORT || 3000;
// Middleware pour parser les requêtes JSON
app.use(express.json());

// Routes
app.use('/api/etudiants', etudiantRoutes);

app.use('/api/utilisateurs', utilisateurRoutes);

// Test de connexion à la base de données et lancement du serveur
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à PostgreSQL réussie.');
    return sequelize.sync(); // Synchroniser les modèles avec la BDD
  })
  .then(() => {
    app.listen(PORT, '0.0.0.0',() => {
      console.log('🚀 Serveur démarré sur http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données :', err);
  });
