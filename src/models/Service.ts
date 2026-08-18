import mongoose, { Document, Schema } from 'mongoose';

// Описываем поля услуги косметолога
export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  duration: number; // длительность в минутах
  createdAt: Date;
  updatedAt: Date;
}

// Схема услуги для MongoDB
const serviceSchema = new Schema<IService>(
  {
    // Название услуги (например: «Чистка лица»)
    name: {
      type: String,
      required: [true, 'Название услуги обязательно'],
      trim: true,
    },

    // Подробное описание процедуры
    description: {
      type: String,
      required: [true, 'Описание обязательно'],
      trim: true,
    },

    // Стоимость в рублях
    price: {
      type: Number,
      required: [true, 'Цена обязательна'],
      min: [0, 'Цена не может быть отрицательной'],
    },

    // Длительность процедуры в минутах
    duration: {
      type: Number,
      required: [true, 'Длительность обязательна'],
      min: [1, 'Длительность должна быть больше 0 минут'],
    },
  },
  {
    timestamps: true,
  }
);

// Экспортируем модель Service
export const Service = mongoose.model<IService>('Service', serviceSchema);
