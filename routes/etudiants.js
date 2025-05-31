const express = require('express');
const router = express.Router();
const etudiantController = require('../controllers/etudiantController');

const controller = require('../controllers/utilisateurController');

router.post('/', etudiantController.createEtudiant);
router.get('/', etudiantController.getAllEtudiants);
router.get('/:id', etudiantController.getEtudiantById);
router.put('/:id', etudiantController.updateEtudiant);
router.delete('/:id', etudiantController.deleteEtudiant);
router.get('/:id/moyenne', etudiantController.getMoyenneEtudiant);
router.get('/stats/global', etudiantController.getStats);




module.exports = router;
