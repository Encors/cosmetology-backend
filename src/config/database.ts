import mongoose from 'mongoose';

/**
 * Подключается к базе данных MongoDB.
 * Строка подключения берётся из переменной окружения MONGODB_URI.
 */
export const connectDatabase = async (): Promise<void> => {
  // Получаем URI из .env или используем значение по умолчанию для локальной разработки
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmetology';

  try {
    // Устанавливаем соединение с MongoDB
    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB подключена успешно');
  } catch (error) {
    // Если подключение не удалось — выводим ошибку и останавливаем процесс
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Закрывает соединение с MongoDB (полезно при завершении работы сервера).
 */
export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB отключена');
};
