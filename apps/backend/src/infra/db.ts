import pg from "pg";

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      "postgres://wide_label:wide_label@localhost:5432/wide_label";
    pool = new pg.Pool({ connectionString });
  }
  return pool;
}

export function setPgPool(customPool: pg.Pool): void {
  pool = customPool;
}

export async function closePgPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
