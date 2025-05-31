const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:odonAdmin@localhost:5432/g_etudiant_android_m1', {
  dialect: 'postgres',
});

module.exports = sequelize;
