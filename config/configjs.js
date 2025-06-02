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
    use_env_variable: "DATABASE_URL",
    password:"npg_aYe14qVOoQs",
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    use_env_variable: "DATABASE_URL",
    password:"npg_aYe14qVOoQs",
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
