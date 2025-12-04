# Тесты Backend

## Запуск тестов

```bash
# Все тесты
npm test

# В watch режиме
npm run test:watch

# С покрытием кода
npm run test:coverage
```

## Структура тестов

```
src/
├── __tests__/
│   ├── setup.ts              # Настройка Jest
│   └── README.md
├── utils/
│   └── __tests__/
│       └── telegramAuth.test.ts
├── services/
│   └── __tests__/
│       └── jwt.test.ts
└── routes/
    └── __tests__/
        └── admin-auth.test.ts
```

## Типы тестов

### Unit тесты

Тестируют отдельные функции и модули:

- `telegramAuth.test.ts` - валидация Telegram initData
- `jwt.test.ts` - генерация и верификация JWT токенов

### Integration тесты

Тестируют API endpoints:

- `admin-auth.test.ts` - авторизация админов

## Покрытие кода

Цель: минимум 70% покрытия для критичной функциональности:

- Аутентификация (Telegram, Admin)
- Валидация данных
- Бизнес-логика (матчи, лайки)

## Best Practices

1. **Именование тестов:**
   - Используйте описательные названия
   - Формат: `should <expected behavior> when <condition>`

2. **Изоляция:**
   - Каждый тест должен быть независимым
   - Используйте `beforeEach` для очистки состояния

3. **Моки:**
   - Мокайте внешние зависимости (БД, API)
   - Не мокайте тестируемый код

4. **Assertions:**
   - Используйте конкретные assertions
   - Проверяйте не только успех, но и ошибки

## Добавление новых тестов

1. Создайте файл `*.test.ts` рядом с тестируемым кодом
2. Импортируйте необходимые зависимости
3. Напишите тесты для всех сценариев
4. Запустите `npm test` для проверки

## Пример

```typescript
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should return expected value for valid input', () => {
    const result = myFunction('valid-input');
    expect(result).toBe('expected-output');
  });

  it('should throw error for invalid input', () => {
    expect(() => myFunction('invalid')).toThrow('Error message');
  });
});
```
