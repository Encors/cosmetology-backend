import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

const router = Router();

// Количество «раундов» соли для bcrypt (чем больше — тем безопаснее, но медленнее)
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Регистрация нового пользователя.
 * Тело запроса: { email, password, role? }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: UserRole;
    };

    // Проверяем, что обязательные поля переданы
    if (!email || !password) {
      res.status(400).json({ message: 'Email и пароль обязательны' });
      return;
    }

    // Проверяем минимальную длину пароля
    if (password.length < 6) {
      res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' });
      return;
    }

    // Проверяем, не занят ли уже такой email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    // Хешируем пароль перед сохранением в базу
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Создаём нового пользователя
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: role ?? 'client',
    });

    // Генерируем JWT-токен для автоматического входа после регистрации
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

/**
 * POST /api/auth/login
 * Вход пользователя по email и паролю.
 * Тело запроса: { email, password }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    // Проверяем наличие email и пароля
    if (!email || !password) {
      res.status(400).json({ message: 'Email и пароль обязательны' });
      return;
    }

    // Ищем пользователя в базе по email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Не раскрываем, что именно неверно — так безопаснее
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    // Сравниваем введённый пароль с хешем из базы
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    // Пароль верный — выдаём JWT-токен
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(200).json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

/**
 * Создаёт JWT-токен с данными пользователя.
 */
function generateToken(userId: string, email: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET не задан в переменных окружения');
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  // Подписываем токен секретным ключом
  return jwt.sign({ userId, email, role }, secret, { expiresIn });
}

export default router;
