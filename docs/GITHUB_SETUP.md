# Настройка GitHub для автоматического деплоя

Это руководство поможет настроить GitHub Actions для автоматического деплоя в Yandex Cloud.

## 📋 Что нужно настроить

1. **Secrets** - секретные ключи (YC_SERVICE_ACCOUNT_KEY)
2. **Environments** - окружения (staging, production)

## 🔐 Шаг 1: Создание Secrets

### 1.1 Откройте страницу Secrets

Перейдите по ссылке:
**https://github.com/vidmichd-lab/lug-date/settings/secrets/actions**

Или вручную:
1. Откройте репозиторий: https://github.com/vidmichd-lab/lug-date
2. Нажмите **Settings** (вкладка вверху)
3. В левом меню выберите **Secrets and variables** → **Actions**

### 1.2 Создайте секрет YC_SERVICE_ACCOUNT_KEY

1. Нажмите **New repository secret**
2. Заполните:
   - **Name:** `YC_SERVICE_ACCOUNT_KEY`
   - **Secret:** 
     - Откройте JSON файл сервисного аккаунта Yandex Cloud
     - Скопируйте **весь** его содержимое (весь JSON объект)
     - Вставьте в поле Secret
3. Нажмите **Add secret**

### 1.3 Проверка формата JSON

JSON должен выглядеть так:
```json
{
  "id": "ajek...",
  "service_account_id": "aje...",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "key_algorithm": "RSA_2048",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

⚠️ **Важно:** 
- Должен быть валидный JSON
- Должны быть все поля (id, service_account_id, private_key и т.д.)
- Скопируйте весь файл целиком, включая фигурные скобки

## 🌍 Шаг 2: Создание Environments

### 2.1 Откройте страницу Environments

Перейдите по ссылке:
**https://github.com/vidmichd-lab/lug-date/settings/environments**

Или вручную:
1. Откройте репозиторий: https://github.com/vidmichd-lab/lug-date
2. Нажмите **Settings**
3. В левом меню выберите **Environments**

### 2.2 Создайте environment "staging"

1. Нажмите **New environment**
2. Введите имя: `staging`
3. Нажмите **Configure environment**
4. Заполните (опционально):
   - **Environment URL:** `https://staging-api.yourdomain.com`
5. Нажмите **Save environment**

### 2.3 Создайте environment "production"

1. Нажмите **New environment**
2. Введите имя: `production`
3. Нажмите **Configure environment**
4. Заполните:
   - **Environment URL:** `https://api.yourdomain.com`
   - **Deployment branches:** 
     - Выберите "Selected branches"
     - Добавьте `main` (только main ветка может деплоить в production)
5. Нажмите **Save environment**

## ✅ Шаг 3: Проверка настройки

### 3.1 Проверьте Secrets

Откройте: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions

Должен быть виден:
- ✅ `YC_SERVICE_ACCOUNT_KEY` (значение скрыто звездочками)

### 3.2 Проверьте Environments

Откройте: https://github.com/vidmichd-lab/lug-date/settings/environments

Должны быть видны:
- ✅ `staging`
- ✅ `production`

## 🧪 Шаг 4: Тестирование

### 4.1 Тест staging окружения

1. Переключитесь на ветку `develop`:
   ```bash
   git checkout develop
   ```

2. Создайте тестовый коммит:
   ```bash
   git commit --allow-empty -m "test: проверка деплоя staging"
   git push
   ```

3. Проверьте GitHub Actions:
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен запуститься workflow "Deploy to Yandex Cloud"
   - Проверьте, что job "Deploy to Staging" использует environment `staging`

### 4.2 Тест production окружения

1. Переключитесь на ветку `main`:
   ```bash
   git checkout main
   ```

2. Создайте тестовый коммит:
   ```bash
   git commit --allow-empty -m "test: проверка деплоя production"
   git push
   ```

3. Проверьте GitHub Actions:
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен запуститься workflow "Deploy to Yandex Cloud"
   - Проверьте, что job "Deploy to Production" использует environment `production`

## 🐛 Решение проблем

### Ошибка: "Resource not accessible by integration"

**Причина:** GitHub Actions не имеет доступа к environment.

**Решение:**
1. Settings → Environments → выберите environment
2. Убедитесь, что нет ограничений на доступ
3. Или добавьте разрешения для GitHub Actions

### Ошибка: "Secret not found"

**Причина:** Секрет не создан или имеет другое имя.

**Решение:**
1. Проверьте имя секрета: должно быть точно `YC_SERVICE_ACCOUNT_KEY`
2. Убедитесь, что секрет создан на уровне репозитория (не environment)
3. Проверьте, что вы находитесь в правильном репозитории

### Ошибка: "Invalid JSON credentials"

**Причина:** Неправильный формат JSON в YC_SERVICE_ACCOUNT_KEY.

**Решение:**
1. Проверьте, что JSON валидный (можно проверить на jsonlint.com)
2. Убедитесь, что скопирован весь файл целиком
3. Проверьте, что нет лишних пробелов или символов в начале/конце
4. Убедитесь, что все поля присутствуют (id, service_account_id, private_key и т.д.)

### Ошибка: "Environment not found"

**Причина:** Environment не создан или имеет другое имя.

**Решение:**
1. Проверьте имена environments в `.github/workflows/deploy.yml`:
   - Должно быть `environment: staging` для staging
   - Должно быть `environment: production` для production
2. Убедитесь, что environments созданы в Settings → Environments

## 📝 Дополнительная информация

### Как получить JSON ключ сервисного аккаунта

1. Откройте Yandex Cloud Console: https://console.cloud.yandex.ru
2. Перейдите в **IAM** → **Service accounts**
3. Выберите нужный сервисный аккаунт
4. Нажмите **Create new key** → **Create JSON key**
5. Скачайте файл и скопируйте его содержимое в GitHub Secret

### Структура workflow

Workflow файл находится в `.github/workflows/deploy.yml` и использует:
- `secrets.YC_SERVICE_ACCOUNT_KEY` - для авторизации в Yandex Cloud
- `environment: staging` - для staging деплоя
- `environment: production` - для production деплоя

### Безопасность

- ✅ Secrets зашифрованы GitHub
- ✅ Значения secrets никогда не показываются в логах
- ✅ Environments могут иметь ограничения на ветки
- ✅ Production environment защищен (только main ветка)

## 🔗 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Yandex Cloud CLI](https://cloud.yandex.ru/docs/cli/quickstart)

