import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
// import articleRoutes from './routes/articleRoutes.js';
import largeFileRoutes from './routes/largeFile.js';
import cosRoutes from './routes/cosRoutes.js';
import errorLogRoutes from './routes/errorLogRoutes.js';
import pool from './config/db.js';
// import { checkJwt } from './middleware/checkJwt.js';

const app = express();

const PORT = process.env.PORT || 4000;

const allowList = [
    'https://dev.ticscreek.top:5173',
    'https://ticscreek.top',
    'http://localhost:5173',
    'http://localhost:3000',
    'null'
];

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
    limit: '2mb',
    strict: true,
    type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use('/articles', articleRoutes);
app.use('/largeFile', largeFileRoutes);
app.use('/cos', cosRoutes);
app.use('/errorLogs', errorLogRoutes);

// 测试数据库连接函数
async function testDatabaseConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1');
        console.log('✅ 数据库连接测试成功:', rows);
    } catch (error) {
        console.error('❌ 数据库连接测试失败:', error.message);
        process.exit(1); // 停止应用启动
    } finally {
        if (connection) connection.release();
    }
}

testDatabaseConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ 应用启动失败:', err.message);
        process.exit(1); // 停止应用启动
    })