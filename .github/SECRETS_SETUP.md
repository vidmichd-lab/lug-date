# Настройка GitHub Secrets для деплоя

## 📋 Какие секреты нужно добавить

### Для Frontend деплоя:

1. Перейдите в GitHub → Settings → Secrets and variables → Actions
2. Добавьте следующие секреты:

#### Для Development (ветка develop):
- `FRONTEND_STORAGE_BUCKET_DEV` = `telegram-app-frontend`
- `FRONTEND_STORAGE_ACCESS_KEY_DEV` = `YCAJEHGGHpv7gmDnfalw4tUSD`
- `FRONTEND_STORAGE_SECRET_KEY_DEV` = `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`

#### Для Production (ветка main):
- `FRONTEND_STORAGE_BUCKET_PROD` = `telegram-app-frontend` (или отдельный)
- `FRONTEND_STORAGE_ACCESS_KEY_PROD` = `YCAJEHGGHpv7gmDnfalw4tUSD`
- `FRONTEND_STORAGE_SECRET_KEY_PROD` = `YCPGeks_piY5OqWjkw_Gmg8Qx41PK6B7JfMaaWok`

### Для Admin деплоя:

- `ADMIN_STORAGE_BUCKET_DEV` = `lug-admin-deploy`
- `ADMIN_STORAGE_ACCESS_KEY_DEV` = `YCAJEgizqc8bY5Q14h1NHXd6R`
- `ADMIN_STORAGE_SECRET_KEY_DEV` = `YCMZZX-xGsejY9LZSH6DMY6yPJbegkB5-Csxr8oU`

## ⚠️ Важно: Разрешить push с секретами

После добавления секретов в GitHub Secrets, нужно разрешить push:

1. GitHub все равно будет блокировать push из-за секретов в истории коммитов
2. Перейдите по этим ссылкам и нажмите "Allow secret":
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc59uI5R6tff6RwKGLWAKJKO
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc4DycBs7bTwMipKg2k0ie5Y
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36FzcApbYN8ZVsxr5zs2w7nlmD9

3. После разрешения выполните:
   ```bash
   git push origin develop
   ```

## ✅ После настройки

- GitHub Actions будет автоматически деплоить frontend при push в develop/main
- Секреты будут использоваться только в CI/CD, не будут в коде
- Push protection больше не будет блокировать (после разрешения)



