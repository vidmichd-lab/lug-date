# Инструкции для деплоя

## 🚀 Быстрый деплой

Проект готов к деплою! Выполните следующие команды:

### Вариант 1: Push через HTTPS (требует авторизации)

```bash
# Переключиться на develop для staging деплоя
git checkout develop

# Запушить код
git push -u origin develop
```

При первом push GitHub попросит авторизоваться. Используйте Personal Access Token.

### Вариант 2: Push через SSH (если настроен SSH ключ)

```bash
# Убедитесь, что remote использует SSH
git remote set-url origin git@github.com:vidmichd-lab/lug-date.git

# Переключиться на develop
git checkout develop

# Запушить код
git push -u origin develop
```

### Вариант 3: Через GitHub Desktop или другой GUI

1. Откройте проект в GitHub Desktop
2. Выберите ветку `develop`
3. Нажмите "Publish branch" или "Push origin"

## 📋 Что произойдет после push

После успешного push в ветку `develop`:

1. **GitHub Actions автоматически запустится:**
   - Job "Run Tests" - проверит код линтером и соберет проект
   - Job "Deploy to Staging" - задеплоит в Yandex Cloud staging окружение

2. **Проверить статус:**
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен появиться новый workflow run "Deploy to Yandex Cloud"

3. **Если деплой успешен:**
   - Backend будет доступен в Yandex Cloud Functions
   - Frontend будет загружен в Yandex Object Storage
   - Bot будет задеплоен в Yandex Cloud Functions

## ⚠️ Важные проверки перед деплоем

Убедитесь, что в GitHub настроено:

- [ ] Secret `YC_SERVICE_ACCOUNT_KEY` создан
- [ ] Environment `staging` создан
- [ ] Environment `production` создан

Проверка: https://github.com/vidmichd-lab/lug-date/settings

## 🔧 Настройка Personal Access Token (для HTTPS)

Если используете HTTPS и нужен токен:

1. Перейдите: https://github.com/settings/tokens
2. Нажмите "Generate new token" → "Generate new token (classic)"
3. Выберите scope: `repo` (полный доступ к репозиториям)
4. Скопируйте токен
5. При push используйте токен как пароль (username - ваш GitHub username)

## 🧪 Тестирование деплоя

### Тест staging (develop ветка):

```bash
git checkout develop
git commit --allow-empty -m "test: проверка деплоя staging"
git push
```

### Тест production (main ветка):

```bash
git checkout main
git commit --allow-empty -m "test: проверка деплоя production"
git push
```

## 📊 Мониторинг деплоя

После push проверьте:

1. **GitHub Actions:** https://github.com/vidmichd-lab/lug-date/actions
2. **Логи деплоя:** Откройте конкретный workflow run → посмотрите логи каждого job
3. **Yandex Cloud Console:** Проверьте, что функции созданы

## ❌ Решение проблем

### Ошибка: "Permission denied"

**Решение:** Настройте SSH ключ или используйте Personal Access Token

### Ошибка: "Secret not found" в GitHub Actions

**Решение:** Убедитесь, что создан секрет `YC_SERVICE_ACCOUNT_KEY` в GitHub Settings

### Ошибка: "Environment not found"

**Решение:** Создайте environments `staging` и `production` в GitHub Settings

### Ошибка: "Invalid JSON credentials"

**Решение:** Проверьте формат JSON в секрете `YC_SERVICE_ACCOUNT_KEY`

## 📖 Дополнительная информация

- [Настройка GitHub](docs/GITHUB_SETUP.md)
- [Проверка настройки](docs/GITHUB_VERIFICATION.md)
- [Пошаговое руководство](docs/SETUP_GUIDE.md)

