require("dotenv").config();
module.exports = {
  host: process.env.APP_HOST,
  port: process.env.APP_PORT,
  appKey: process.env.APP_KEY,
  jwtSecret: process.env.JWT_SECRET,
  firebaseSecret: process.env.FIREBASE_SECRET,
  apiUrl: (service) => "/api/v1/" + service,
  baseUrl: (protocol) => {
    const basePath = "examshare.twisted-it.de";
    return protocol ? protocol + "://" + basePath : basePath;
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  databaseUrl: `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`,
  values: {
    pageCount: 20,
  },
};
