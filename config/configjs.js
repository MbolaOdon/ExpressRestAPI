const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  development: {
    username: "postgres",
    password: "odonAdmin",
    database: "g_etudiant_android_m1",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: false
    }
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
