# Настройка GitHub Secret для Bot Production

## ✅ Production функция бота создана

**Function ID:** `d4ejmsp9tfulgbo0apn8`  
**Function Name:** `dating-app-bot-prod`  
**URL:** https://functions.yandexcloud.net/d4ejmsp9tfulgbo0apn8

## 📋 Как добавить секрет в GitHub

1. Перейдите в GitHub репозиторий: https://github.com/vidmichd-lab/lug-date

2. Откройте **Settings** → **Secrets and variables** → **Actions**

3. Нажмите **New repository secret**

4. Добавьте следующий секрет:
   - **Name:** `YC_BOT_FUNCTION_ID_PROD`
   - **Value:** `d4ejmsp9tfulgbo0apn8`

5. Нажмите **Add secret**

## ✅ После добавления

GitHub Actions автоматически будет деплоить бота в production при push в ветку `main`.

## 🔍 Проверка

После добавления секрета, при следующем деплое в production вы увидите:

```
🤖 Deploying bot to function: d4ejmsp9tfulgbo0apn8
✅ Bot deployed successfully
```

Вместо предупреждения:

```
⚠️  Warning: YC_BOT_FUNCTION_ID_PROD is not set in GitHub Secrets
```

## 📝 Дополнительные секреты для Bot (если еще не добавлены)

Убедитесь, что также добавлены:

- `TELEGRAM_BOT_TOKEN_PROD` - Токен Telegram бота для production

---

**Статус функций:**

- ✅ Staging: `d4ebl4ncphnagh0vi5fc` (dating-app-bot-staging)
- ✅ Production: `d4ejmsp9tfulgbo0apn8` (dating-app-bot-prod)
