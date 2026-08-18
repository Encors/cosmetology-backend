import mongoose, { Document, Schema } from 'mongoose';

// Допустимые роли пользователя в системе
export type UserRole = 'admin' | 'client';

// Описываем, какие поля есть у пользователя в TypeScript
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Схема — «чертёж» документа User в MongoDB
const userSchema = new Schema<IUser>(
  {
    // Email — уникальный логин пользователя
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Хеш пароля (сам пароль в базе НЕ храним!)
    passwordHash: {
      type: String,
      required: [true, 'Пароль обязателен'],
    },

    // Роль: администратор или клиент
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
    },
  },
  {
    // Автоматически добавляет поля createdAt и updatedAt
    timestamps: true,
  }
);

// Создаём модель User на основе схемы
export const User = mongoose.model<IUser>('User', userSchema);
