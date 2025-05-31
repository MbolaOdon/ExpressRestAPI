const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etudiant = sequelize.define('Etudiant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numEt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note_math: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  note_phys: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'etudiant',
  timestamps: false
});

module.exports = Etudiant;
