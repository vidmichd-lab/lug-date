# Figma Import Scripts

Скрипты для работы с Figma API и импорта дизайн-системы.

## Тестирование подключения

Перед полным импортом рекомендуется проверить подключение:

```bash
npm run test:figma
```

Этот скрипт проверяет:
- ✅ Валидность `FIGMA_TOKEN`
- ✅ Доступ к Figma файлу
- ✅ Базовую информацию о файле (название, дата изменения, страницы)
- ✅ Наличие Variables в файле
- ✅ Наличие Components в файле

## Настройка

1. Получите Figma Personal Access Token:
   - Перейдите в Figma Settings → Account → Personal Access Tokens
   - Создайте новый токен

2. Добавьте в `.env` файл в корне проекта:
   ```env
   FIGMA_TOKEN=ваш_токен_из_figma
   FIGMA_FILE_ID=EEEblmXzjWISAPdvHnzD9N
   ```

## Использование

### 1. Тестирование подключения

```bash
npm run test:figma
```

### 2. Полный импорт дизайн-системы

#### Через REST API (стандартный способ):
```bash
npm run import:figma
```

#### Через MCP Figma Desktop (для получения Variables):
```bash
npm run import:figma:mcp
```

**MCP способ:**
1. Откройте Figma Desktop приложение
2. Откройте файл с дизайн-системой
3. Выберите узел с Variables (или корневой узел)
4. Запустите команду

MCP позволяет получить Variables без Enterprise плана!

## Что делает скрипт

1. **Подключается к Figma API** и загружает файл дизайн-системы
2. **Извлекает токены**:
   - Variables (цвета, отступы, размеры)
   - Text Styles (типографика)
   - Effect Styles (тени, блюры)
3. **Генерирует файлы**:
   - TypeScript токены (`tokens/*.ts`)
   - CSS переменные (`tokens/tokens.css`)
   - React компоненты (`components/*/`)
4. **Создает документацию** в `docs/design-system.md`
5. **Форматирует код** с помощью Prettier

## Структура результата

```
frontend/src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── breakpoints.ts
│   ├── index.ts
│   └── tokens.css
└── components/
    ├── Button/
    │   ├── Button.tsx
    │   ├── Button.types.ts
    │   ├── Button.module.css
    │   └── index.ts
    └── ...
```

## Обработка ошибок

Скрипт обрабатывает следующие ошибки:
- Неверный или отсутствующий `FIGMA_TOKEN`
- Нет доступа к файлу Figma
- Проблемы с парсингом компонентов (пропускает с предупреждением)

## Логирование

Скрипт выводит подробную информацию о процессе:
- Прогресс импорта
- Количество созданных токенов и компонентов
- Предупреждения и ошибки

