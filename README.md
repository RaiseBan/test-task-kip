# Система бронирования мест на мероприятия

## Описание

API для бронирования мест на мероприятия с защитой от дублирования бронирований и race conditions.

**Основной функционал:**
- Бронирование места на событие
- Защита от двойного бронирования одним пользователем
- Контроль доступных мест
- Кеширование данных о доступности мест

## Технологии

- **Node.js** + **TypeScript**
- **Fastify** - веб-фреймворк
- **TypeORM** - ORM для работы с БД
- **PostgreSQL** - основная БД
- **Redis** - кеширование
- **Docker** - контейнеризация

## Структура БД

**events:**
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- total_seats (INT)

**bookings:**
- id (SERIAL PRIMARY KEY)
- event_id (INT, FK -> events)
- user_id (VARCHAR)
- created_at (TIMESTAMP)
- UNIQUE(event_id, user_id)

## Установка и запуск

### 1. Клонировать репозиторий и установить зависимости

```bash
npm install
```

### 2. Создать файл .env

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=booking_db

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000
```

### 3. Запустить через Docker Compose

```bash
docker-compose up --build
```

Сервер запустится на `http://localhost:3000`

### 4. Создать тестовое событие

```bash
docker exec -it booking_postgres psql -U postgres -d booking_db
```

В psql:
```sql
INSERT INTO events (name, total_seats) VALUES ('Концерт', 100);
INSERT INTO events (name, total_seats) VALUES ('Конференция', 50);
SELECT * FROM events;
\q
```

## API Endpoints

- `POST /api/bookings/reserve` - создать бронирование
- `GET /api/bookings/:id` - получить бронирование
- `GET /api/events/:id` - получить событие с доступными местами
- `DELETE /api/bookings/:id` - удалить бронирование
- `GET /health` - проверка здоровья сервиса
- `GET /metrics/:id` - получение статистики бронирвоания пользователя

## Тестирование

### Swagger UI (рекомендуется)

После запуска откройте в браузере: **http://localhost:3000/docs**

Swagger UI предоставляет интерактивный интерфейс для тестирования всех API endpoints.

### Основные тестовые сценарии

1. **Создать бронирование** - POST `/api/bookings/reserve`
2. **Повторное бронирование** - должна вернуться ошибка "Вы уже забронировали место"
3. **Проверить доступные места** - GET `/api/events/{id}`
4. **Получить бронирование** - GET `/api/bookings/{id}`
5. **Удалить бронирование** - DELETE `/api/bookings/{id}`
6. **Переполнение мест** - забронировать все места и попробовать еще раз

### Примеры curl команд

Создать бронирование:
```bash
curl -X POST http://localhost:3000/api/bookings/reserve \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1, "user_id": "user123"}'
```

Проверить доступные места:
```bash
curl -X GET http://localhost:3000/api/events/1
```

## Особенности реализации

1. **Защита от race conditions** - использование `pessimistic_write` lock в транзакции PostgreSQL
2. **Защита от дублирования** - уникальный индекс на `(event_id, user_id)` в БД
3. **Кеширование** - Redis используется для кеширования доступных мест (TTL 60 сек)
4. **Валидация** - JSON Schema для валидации входящих данных
5. **Graceful shutdown** - корректное завершение работы при остановке

## Остановка

```bash
docker-compose down
```

Для очистки всех данных:
```bash
docker-compose down -v
```