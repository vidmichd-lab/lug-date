# Настройка Yandex AppMetrica в .env

## Добавьте в ваш .env файл:

```bash
# Yandex AppMetrica
VITE_YANDEX_METRICA_ID=4809916
```

## Дополнительная информация

- **AppMetrica ID:** 4809916
- **API key (для SDK):** 3fdf8d82-1c23-413e-8870-75bbac42ebd7
- **Post API key:** 700c6ca2-4e4f-4447-922b-b864e0072559

**Примечание:** Для frontend достаточно только `VITE_YANDEX_METRICA_ID`. API keys используются для backend интеграции (если потребуется).

## После добавления

1. Перезапустите dev сервер:
   ```bash
   npm run dev:frontend
   ```

2. Проверьте консоль браузера - должны быть сообщения:
   ```
   ✅ Yandex Metrica initialized
   ✅ Yandex AppMetrica ready for error tracking
   ```

Подробная документация: [docs/APPMETRICA_SETUP.md](docs/APPMETRICA_SETUP.md)



