const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const config = require('./config/config');
const etudiantRoutes = require('./routes/etudiants');
const utilisateurRoutes = require('./routes/utilisateurs');

// Chargement des variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Routes
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

// Configuration de Sequelize en fonction de l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Ajout de l'URL de la base de données si elle est définie dans les variables d'environnement
if (dbConfig.url) {
  dbConfig.url = process.env.DATABASE_URL;
}

const sequelize = dbConfig.url 
  ? new Sequelize(dbConfig.url, {
      dialect: dbConfig.dialect,
      dialectOptions: dbConfig.dialectOptions,
      logging: console.log
    })
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      dialectOptions: dbConfig.dialectOptions,
      logging: console.log
    });

// Test de connexion à la base de données et lancement du serveur
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie.');
    
    // Synchronisation des modèles avec la BDD (optionnel en production)
    if (env !== 'production') {
      await sequelize.sync();
      console.log('🔃 Modèles synchronisés avec la base de données');
    } else {
      console.log('⚡ Mode production - Pas de synchronisation automatique');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`🔌 Environnement: ${env}`);
      console.log(`🗄️ Base de données: ${dbConfig.url || dbConfig.host}`);
    });

  } catch (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.log('\n=== Détails de configuration ===');
    console.log(`Environnement: ${env}`);
    console.log(`Hôte: ${dbConfig.host || dbConfig.url}`);
    console.log(`Base de données: ${dbConfig.database}`);
    console.log(`Utilisateur: ${dbConfig.username}`);
    console.log('===============================\n');
    
    // Le serveur peut quand même démarrer en mode dégradé
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Serveur démarré SANS connexion à la base de données sur le port ${PORT}`);
    });
  }
}

startServer();

// Export pour les tests
module.exports = { app, sequelize };