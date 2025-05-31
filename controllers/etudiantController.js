const Etudiant = require('../models/Etudiant');

// CREATE
exports.createEtudiant = async (req, res) => {
  try {
    const etudiant = await Etudiant.create(req.body);
    res.status(201).json(etudiant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ALL
exports.getAllEtudiants = async (req, res) => {
  try {
    const etudiants = await Etudiant.findAll();
    res.json(etudiants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getEtudiantById = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByPk(req.params.id);
    if (!etudiant) return res.status(404).send('Étudiant non trouvé');
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateEtudiant = async (req, res) => {
  try {
    const updated = await Etudiant.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated[0] === 0) return res.status(404).send('Étudiant non trouvé');
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteEtudiant = async (req, res) => {
  try {
    const deleted = await Etudiant.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).send('Étudiant non trouvé');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//  Supprimer un étudiant
exports.deleteEtudiant = async (req, res) => {
    try {
      await Etudiant.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Supprimé' });
    } catch (error) {
      res.status(400).json({ message: 'Erreur suppression', error });
    }
  };
  
  //  Récupérer la moyenne d'un étudiant spécifique
exports.getMoyenneEtudiant = async (req, res) => {
    try {
      const etudiant = await Etudiant.findByPk(req.params.id);
  
      if (!etudiant) {
        return res.status(404).json({ message: "Étudiant non trouvé." });
      }
  
      const moyenne = (etudiant.note_math + etudiant.note_phys) / 2;
  
      res.json({
        id: etudiant.id,
        nom: etudiant.nom,
        moyenne: moyenne.toFixed(2)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  };
  

  //  Statistiques de classe
  exports.getStats = async (req, res) => {
    try {
      const etudiants = await Etudiant.findAll();
  
      if (etudiants.length === 0) {
        return res.json({ message: "Aucun étudiant" });
      }
  
      const moyennes = etudiants.map(e => (e.note_math + e.note_phys) / 2);
      const moyenneClasse = moyennes.reduce((acc, val) => acc + val, 0) / moyennes.length;
      const min = Math.min(...moyennes);
      const max = Math.max(...moyennes);
      const admis = moyennes.filter(m => m >= 10).length;
      const redoublants = moyennes.filter(m => m < 10).length;
  
      res.json({
        moyenne_classe: moyenneClasse.toFixed(2),
        moyenne_minimale: min.toFixed(2),
        moyenne_maximale: max.toFixed(2),
        admis,
        redoublants
      });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur statistiques", error });
    }
  };