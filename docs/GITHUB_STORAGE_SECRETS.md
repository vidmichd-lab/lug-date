# Настройка GitHub Secrets для Object Storage

Инструкция по добавлению ключей доступа к Yandex Object Storage в GitHub Secrets для автоматического деплоя.

## 🔑 Ваши ключи

**Имя бакета:** `telegram-app-frontend`

**Access Key ID:** `YCAJEHGGHpv7gmDnfalw4tUSD`

**Secret Access Key:** `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`

---

## 🚀 Быстрая настройка (5 минут)

### Шаг 1: Откройте настройки GitHub Secrets

**Прямая ссылка:**
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

**Или через интерфейс:**
1. Перейдите в ваш репозиторий на GitHub
2. Нажмите на **"Settings"** (Настройки)
3. В левом меню выберите **"Secrets and variables"** → **"Actions"**
4. Нажмите **"New repository secret"** (Новый секрет репозитория)

---

## Шаг 2: Добавьте Secrets для Staging (ветка develop)

Создайте следующие secrets (нажмите **"New repository secret"** для каждого):

### Secret 1: YANDEX_STORAGE_BUCKET_DEV

1. **Name:** `YANDEX_STORAGE_BUCKET_DEV`
2. **Secret:** `telegram-app-frontend`
3. Нажмите **"Add secret"**

### Secret 2: YANDEX_STORAGE_ACCESS_KEY_DEV

1. **Name:** `YANDEX_STORAGE_ACCESS_KEY_DEV`
2. **Secret:** `YCAJEHGGHpv7gmDnfalw4tUSD`
3. Нажмите **"Add secret"**

### Secret 3: YANDEX_STORAGE_SECRET_KEY_DEV

1. **Name:** `YANDEX_STORAGE_SECRET_KEY_DEV`
2. **Secret:** `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`
3. Нажмите **"Add secret"**

**✅ После добавления всех трех secrets для DEV, переходите к следующему шагу**

---

## Шаг 3: Добавьте Secrets для Production (ветка main)

Для production используем те же ключи (можно создать отдельные позже):

### Secret 1: FRONTEND_STORAGE_BUCKET_PROD

1. **Name:** `FRONTEND_STORAGE_BUCKET_PROD`
2. **Secret:** `telegram-app-frontend` (или другое имя для production)
3. Нажмите **"Add secret"**

### Secret 2: FRONTEND_STORAGE_ACCESS_KEY_PROD

1. **Name:** `FRONTEND_STORAGE_ACCESS_KEY_PROD`
2. **Secret:** `YCAJEHGGHpv7gmDnfalw4tUSD`
3. Нажмите **"Add secret"**

### Secret 3: FRONTEND_STORAGE_SECRET_KEY_PROD

1. **Name:** `FRONTEND_STORAGE_SECRET_KEY_PROD`
2. **Secret:** `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`
3. Нажмите **"Add secret"**

**✅ После добавления всех трех secrets для PROD, готово!**

---

## Шаг 4: Проверка (Готово!)

После добавления всех 6 secrets проверьте:

1. **Проверьте список secrets:**
   - Должны быть видны все 6 secrets для frontend:
     - ✅ `FRONTEND_STORAGE_BUCKET_DEV`
     - ✅ `FRONTEND_STORAGE_ACCESS_KEY_DEV`
     - ✅ `FRONTEND_STORAGE_SECRET_KEY_DEV`
     - ✅ `FRONTEND_STORAGE_BUCKET_PROD`
     - ✅ `FRONTEND_STORAGE_ACCESS_KEY_PROD`
     - ✅ `FRONTEND_STORAGE_SECRET_KEY_PROD`

2. **Сделайте тестовый push:**
   ```bash
   # Внесите любое изменение в frontend
   echo "test" >> frontend/src/test.txt
   git add .
   git commit -m "Test frontend deployment"
   git push origin develop
   ```

3. **Проверьте GitHub Actions:**
   - Перейдите в **"Actions"** в вашем репозитории
   - Должен запуститься workflow **"Deploy Frontend to Yandex Object Storage"**
   - Проверьте, что он выполнился успешно (зеленая галочка)
   - В логах увидите URL: `https://telegram-app-frontend.website.yandexcloud.net/`

**🎉 Готово! Теперь при каждом push в `develop` или `main` frontend будет автоматически деплоиться!**

---

## Шаг 5: Настройка Environments (опционально)

Для дополнительной защиты production можно настроить Environments:

1. В настройках репозитория перейдите в **"Environments"**
2. Создайте Environment **"staging"**:
   - Нажмите **"New environment"**
   - Имя: `staging`
   - Нажмите **"Configure environment"**
3. Создайте Environment **"production"**:
   - Нажмите **"New environment"**
   - Имя: `production`
   - Можно добавить защиту ветки (только main)
   - Нажмите **"Configure environment"**

**Примечание:** Workflow уже настроен на использование environments, но они не обязательны для работы.

---

## Список всех необходимых Secrets

### Для Staging (ветка develop):
- ✅ `FRONTEND_STORAGE_BUCKET_DEV` = `telegram-app-frontend`
- ✅ `FRONTEND_STORAGE_ACCESS_KEY_DEV` = `YCAJEHGGHpv7gmDnfalw4tUSD`
- ✅ `FRONTEND_STORAGE_SECRET_KEY_DEV` = `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`

### Для Production (ветка main):
- ✅ `FRONTEND_STORAGE_BUCKET_PROD` = `telegram-app-frontend` (или отдельный)
- ✅ `FRONTEND_STORAGE_ACCESS_KEY_PROD` = `YCAJEHGGHpv7gmDnfalw4tUSD`
- ✅ `FRONTEND_STORAGE_SECRET_KEY_PROD` = `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`

**⚠️ Примечание:** Используем префикс `FRONTEND_` чтобы не конфликтовать с существующими `YANDEX_STORAGE_*` secrets для backend.

---

## Как это работает

После настройки:

1. **При push в ветку `develop`:**
   - GitHub Actions автоматически соберет frontend
   - Загрузит файлы в staging бакет (`telegram-app-frontend`)
   - Использует secrets с префиксом `FRONTEND_` и суффиксом `_DEV`

2. **При push в ветку `main`:**
   - GitHub Actions автоматически соберет frontend
   - Загрузит файлы в production бакет
   - Использует secrets с префиксом `FRONTEND_` и суффиксом `_PROD`

**Преимущества использования `FRONTEND_` префикса:**
- ✅ Не конфликтует с существующими `YANDEX_STORAGE_*` secrets для backend
- ✅ Понятно, что это secrets для frontend
- ✅ Можно использовать разные бакеты для frontend и backend

---

## Быстрая ссылка

Прямая ссылка на настройку secrets:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

Замените `YOUR_USERNAME` и `YOUR_REPO` на ваши значения.

---

## Частые проблемы

### Проблема: "Secret not found" в GitHub Actions

**Решение:**
- Убедитесь, что имя secret точно совпадает (с учетом регистра)
- Проверьте, что secret добавлен в правильный репозиторий
- Убедитесь, что нет лишних пробелов в имени или значении

### Проблема: "Access Denied" при деплое

**Решение:**
- Проверьте, что ключи скопированы полностью (без пробелов)
- Убедитесь, что сервисный аккаунт имеет права на запись в бакет
- Проверьте правильность имени бакета

### Проблема: Workflow не запускается

**Решение:**
- Проверьте, что файл `.github/workflows/deploy-frontend.yml` существует
- Убедитесь, что вы делаете push в ветки `main` или `develop`
- Проверьте, что изменения в папке `frontend/` есть в коммите

---

## Полезные ссылки

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments)
- [Инструкция по деплою](YANDEX_OBJECT_STORAGE_DEPLOY.md)
- [Настройка GitHub Actions](GITHUB_DEPLOY_SETUP.md)

---

**Последнее обновление:** 2024-12-01

