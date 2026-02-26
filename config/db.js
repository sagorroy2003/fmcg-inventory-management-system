import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database connected successfully`);
    console.log(`📦 Host     : ${process.env.DB_HOST || "localhost"}`);
    console.log(`📂 Database : ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL Database");
    console.error(`🔴 Error Code    : ${error.code}`);
    console.error(`🔴 Error Message : ${error.message}`);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("⚠️  Check your DB_USER or DB_PASSWORD in the .env file.");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error(
        "⚠️  Database not found. Check your DB_NAME in the .env file.",
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "⚠️  Connection refused. Is MySQL running? Check DB_HOST and DB_PORT.",
      );
    }
    process.exit(1);
  }
})();

export default pool;
