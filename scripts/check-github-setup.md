# Проверка настройки GitHub для деплоя

Этот файл содержит инструкции для проверки правильности настройки GitHub Actions.

## Чеклист настройки

### ✅ Secrets (Секреты)

1. Откройте: https://github.com/vidmichd-lab/lug-date/settings/secrets/actions
2. Проверьте наличие секрета:
   - [ ] `YC_SERVICE_ACCOUNT_KEY` - должен быть создан

### ✅ Environments (Окружения)

1. Откройте: https://github.com/vidmichd-lab/lug-date/settings/environments
2. Проверьте наличие окружений:
   - [ ] `staging` - для ветки develop
   - [ ] `production` - для ветки main

### ✅ Workflow файл

1. Проверьте файл: `.github/workflows/deploy.yml`
2. Убедитесь, что:
   - [ ] Используется `environment: staging` для deploy-staging
   - [ ] Используется `environment: production` для deploy-production
   - [ ] Используется `secrets.YC_SERVICE_ACCOUNT_KEY`

## Как проверить через GitHub CLI (опционально)

Если у вас установлен GitHub CLI:

```bash
# Проверить secrets (требует авторизации)
gh secret list --repo vidmichd-lab/lug-date

# Проверить environments
gh api repos/vidmichd-lab/lug-date/environments
```

## Тестирование

После настройки можно протестировать:

1. Создайте тестовый коммит в ветке `develop`:
   ```bash
   git checkout develop
   git commit --allow-empty -m "test: проверка деплоя staging"
   git push
   ```

2. Проверьте Actions:
   - Откройте: https://github.com/vidmichd-lab/lug-date/actions
   - Должен запуститься workflow "Deploy to Yandex Cloud"
   - Проверьте, что deploy-staging использует environment `staging`

3. Если все работает, можно протестировать production:
   ```bash
   git checkout main
   git commit --allow-empty -m "test: проверка деплоя production"
   git push
   ```

## Возможные проблемы

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

### Ошибка: "Invalid JSON credentials"

**Причина:** Неправильный формат JSON в YC_SERVICE_ACCOUNT_KEY.

**Решение:**
1. Проверьте, что JSON валидный
2. Убедитесь, что скопирован весь файл целиком
3. Проверьте, что нет лишних пробелов или символов



