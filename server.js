const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Chargement des variables d'environnement en premier
dotenv.config();

// Configuration de base
const PORT = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour gérer les erreurs de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Format JSON invalide' });
  }
  next();
});

// Configuration de la base de données
let sequelize;

try {
  // Chargement de la configuration après dotenv.config()
  const config = require('./config/config');
  const dbConfig = config[env];

  // Configuration de Sequelize
  if (process.env.DATABASE_URL) {
    // Utilisation de l'URL de base de données (priorité aux variables d'environnement)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: dbConfig?.dialect || 'postgres',
      dialectOptions: dbConfig?.dialectOptions || {},
      logging: env === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else if (dbConfig) {
    // Configuration traditionnelle avec paramètres séparés
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      dialectOptions: dbConfig.dialectOptions || {},
      logging: env === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    throw new Error('Configuration de base de données manquante');
  }
} catch (configError) {
  console.error('❌ Erreur lors du chargement de la configuration:', configError.message);
  console.log('⚠️ Le serveur démarrera sans connexion à la base de données');
}

// Chargement des routes après la configuration de Sequelize
let etudiantRoutes, utilisateurRoutes;
try {
  etudiantRoutes = require('./routes/etudiants');
  utilisateurRoutes = require('./routes/utilisateurs');
  
  // Configuration des routes
  app.use('/api/etudiants', etudiantRoutes);
  app.use('/api/utilisateurs', utilisateurRoutes);
} catch (routeError) {
  console.warn('⚠️ Erreur lors du chargement des routes:', routeError.message);
  console.log('Le serveur démarrera sans certaines routes');
}

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'Serveur API fonctionnel',
    environment: env,
    timestamp: new Date().toISOString(),
    database: sequelize ? 'Connecté' : 'Non connecté'
  });
});

// Route de santé
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env,
    database: 'Non connecté'
  };

  if (sequelize) {
    try {
      await sequelize.authenticate();
      health.database = 'Connecté';
    } catch (error) {
      health.database = 'Erreur de connexion';
      health.status = 'WARNING';
    }
  }

  res.json(health);
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: env === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Fonction de démarrage du serveur
async function startServer() {
  try {
    // Test de connexion à la base de données si Sequelize est configuré
    if (sequelize) {
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données réussie.');

      // Synchronisation des modèles (uniquement en développement)
      if (env === 'development') {
        await sequelize.sync({ alter: true });
        console.log('🔃 Modèles synchronisés avec la base de données');
      } else {
        console.log('⚡ Mode production - Pas de synchronisation automatique');
      }
    }

    // Démarrage du serveur
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`🔌 Environnement: ${env}`);
      
      if (sequelize) {
        const dbInfo = process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'URL configurée' :
          `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`;
        console.log(`🗄️ Base de données: ${dbInfo}`);
      } else {
        console.log('🗄️ Base de données: Non configurée');
      }
    });

    // Gestion propre de l'arrêt du serveur
    const gracefulShutdown = async (signal) => {
      console.log(`\n📶 Signal ${signal} reçu, arrêt en cours...`);
      
      server.close(async () => {
        console.log('🔌 Serveur HTTP fermé');
        
        if (sequelize) {
          try {
            await sequelize.close();
            console.log('🗄️ Connexion à la base de données fermée');
          } catch (error) {
            console.error('❌ Erreur lors de la fermeture de la base de données:', error);
          }
        }
        
        console.log('👋 Arrêt complet du serveur');
        process.exit(0);
      });
      
      // Force l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⏰ Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    // Écoute des signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    
    if (env === 'development') {
      console.log('\n=== Détails de l\'erreur ===');
      console.log(error.stack);
      console.log('========================\n');
    }

    // En cas d'erreur, on peut quand même démarrer le serveur en mode dégradé
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Serveur démarré en mode dégradé sur le port ${PORT}`);
      console.log('🔧 Vérifiez la configuration de votre base de données');
    });

    return server;
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  if (env === 'development') {
    console.log('Promise:', promise);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

// Démarrage du serveur
if (require.main === module) {
  startServer();
}

// Export pour les tests et l'utilisation externe
module.exports = { 
  app, 
  sequelize, 
  startServer 
};