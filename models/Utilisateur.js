const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false
});

module.exports = Utilisateur;
