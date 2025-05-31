const bcrypt = require('bcrypt');
const { Utilisateur } = require('../models');

// Enregistrement d'un utilisateur
exports.ajouterUtilisateur = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;

    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({ nom, email, mot_de_passe: hash });
    res.status(201).json({ message: 'Utilisateur créé avec succès.', utilisateur });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création.', error: err.message });
  }
};

// Connexion (login)
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const utilisateur = await Utilisateur.findOne({ where: { email } });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Email incorrect.' });
    }

    const match = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!match) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    res.json({ message: 'Connexion réussie.', utilisateur });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion.', error: err.message });
  }
};

// Lire tous les utilisateurs
exports.getAllUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// Lire un utilisateur par ID
exports.getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// Modifier un utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;
    const utilisateur = await Utilisateur.findByPk(req.params.id);

    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.email = email || utilisateur.email;

    if (mot_de_passe) {
      utilisateur.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
    }

    await utilisateur.save();
    res.json({ message: 'Utilisateur mis à jour.', utilisateur });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};

// Supprimer un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
};
