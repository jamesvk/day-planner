import pg from "pg";
const { Pool } = pg;

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(`No connection string for NODE_ENV=${process.env.NODE_ENV}`);
}

const pool = new Pool({
  connectionString,
});

export default pool;
