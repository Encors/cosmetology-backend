
// seed/seed.js
// Этот скрипт выполняется автоматически при первом запуске MongoDB

// Подключаемся к базе
const db = connect('mongodb://localhost:27017/cosmetology');

print('🌱 Начинаем заполнение базы тестовыми данными...');

// Очищаем коллекции
db.users.drop();
db.services.drop();

// ============================================
// 1. СОЗДАЁМ АДМИНИСТРАТОРА
// ============================================
// ВНИМАНИЕ: В реальном проекте пароль должен быть захеширован!
// Здесь для примера используется простой пароль

const adminPasswordHash = '$2b$10$your-hashed-password-here'; // bcrypt hash для "admin123"

db.users.insertOne({
    email: 'admin@cosmetology.ru',
    passwordHash: adminPasswordHash,
    fullName: 'Администратор',
    phone: '+70000000000',
    role: 'admin',
    createdAt: new Date()
});

print('✅ Администратор создан: admin@cosmetology.ru / admin123');

// ============================================
// 2. СОЗДАЁМ УСЛУГИ
// ============================================
const services = [
    {
        name: 'Чистка лица',
        description: 'Глубокая чистка лица с использованием ультразвука. Удаляет чёрные точки, выравнивает тон кожи.',
        price: 5000,
        duration: 60,
        isActive: true,
        createdAt: new Date()
    },
    {
        name: 'Лазерная эпиляция (зона бикини)',
        description: 'Безболезненное удаление волос в зоне бикини. Результат сохраняется до 6 месяцев.',
        price: 3500,
        duration: 30,
        isActive: true,
        createdAt: new Date()
    },
    {
        name: 'Массаж лица',
        description: 'Классический массаж лица для улучшения кровообращения и лифтинг-эффекта.',
        price: 4000,
        duration: 45,
        isActive: true,
        createdAt: new Date()
    },
    {
        name: 'Биоревитализация',
        description: 'Инъекционная процедура с гиалуроновой кислотой для увлажнения и омоложения кожи.',
        price: 12000,
        duration: 60,
        isActive: true,
        createdAt: new Date()
    },
    {
        name: 'Чистка лица (комбинированная)',
        description: 'Сочетает механическую и ультразвуковую чистку. Подходит для жирной и проблемной кожи.',
        price: 6000,
        duration: 90,
        isActive: true,
        createdAt: new Date()
    }
];

db.services.insertMany(services);

print(`✅ Создано ${services.length} услуг`);

// ============================================
// 3. СОЗДАЁМ ТЕСТОВЫХ КЛИЕНТОВ
// ============================================
const clientPasswordHash = '$2b$10$your-hashed-password-here'; // bcrypt hash для "client123"

const clients = [
    {
        email: 'anna@example.com',
        passwordHash: clientPasswordHash,
        fullName: 'Анна Иванова',
        phone: '+79991234567',
        role: 'client',
        createdAt: new Date()
    },
    {
        email: 'maria@example.com',
        passwordHash: clientPasswordHash,
        fullName: 'Мария Петрова',
        phone: '+79997654321',
        role: 'client',
        createdAt: new Date()
    },
    {
        email: 'olga@example.com',
        passwordHash: clientPasswordHash,
        fullName: 'Ольга Смирнова',
        phone: '+79998887766',
        role: 'client',
        createdAt: new Date()
    }
];

db.users.insertMany(clients);

print(`✅ Создано ${clients.length} тестовых клиентов`);

// ============================================
// 4. СОЗДАЁМ ЗАПИСИ (для примера)
// ============================================
// Берём ID услуг и клиентов
const serviceIds = db.services.find({}, { _id: 1 }).toArray().map(s => s._id);
const clientIds = db.users.find({ role: 'client' }, { _id: 1 }).toArray().map(c => c._id);

const appointments = [
    {
        clientId: clientIds[0],
        serviceId: serviceIds[0],
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // завтра
        time: '10:00',
        status: 'confirmed',
        comment: 'Хочу сделать чистку, кожа жирная',
        createdAt: new Date()
    },
    {
        clientId: clientIds[1],
        serviceId: serviceIds[1],
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // послезавтра
        time: '14:30',
        status: 'pending',
        comment: '',
        createdAt: new Date()
    }
];

// Если есть клиенты и услуги, создаём записи
if (clientIds.length > 0 && serviceIds.length > 0) {
    // Создаём коллекцию appointments, если её нет
    db.createCollection('appointments');
    db.appointments.insertMany(appointments);
    print(`✅ Создано ${appointments.length} тестовых записей`);
}

print('🎉 База данных успешно заполнена!');