// CRUD
const express = require('express');
const router = express.Router();
const controller = require('../controllers/utilisateurController');
router.post('/', controller.ajouterUtilisateur);
router.get('/', controller.getAllUtilisateurs);
router.get('/:id', controller.getUtilisateurById);
router.put('/:id', controller.updateUtilisateur);
router.delete('/:id', controller.supprimerUtilisateur);

// Login
router.post('/login', controller.login);

module.exports = router;



// {
//     "nom": "odon Odon",
//     "email": "odon@gmail.com",
//     "mot_de_passe": "1234"
//   }