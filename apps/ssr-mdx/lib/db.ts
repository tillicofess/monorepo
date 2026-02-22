import mysql, {
  type Pool,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from 'mysql2/promise';

const poolConfig: PoolOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

export async function query<T = RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows as T;
  } finally {
    conn.release();
  }
}

export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const conn = await getPool().getConnection();
  try {
    const [result] = await conn.execute<ResultSetHeader>(sql, params as never);
    return result;
  } finally {
    conn.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
