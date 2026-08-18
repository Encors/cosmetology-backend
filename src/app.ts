import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRouter from './routes/auth';

// Загружаем переменные окружения из файла .env
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Маршруты авторизации: /api/auth/register и /api/auth/login
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Что-то пошло не так',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Запуск сервера (только если файл запущен напрямую, а не импортирован в тестах)
if (require.main === module) {
    const startServer = async (): Promise<void> => {
        // Сначала подключаемся к MongoDB, затем поднимаем HTTP-сервер
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });
    };

    startServer().catch((error) => {
        console.error('Не удалось запустить сервер:', error);
        process.exit(1);
    });
}

export default app;