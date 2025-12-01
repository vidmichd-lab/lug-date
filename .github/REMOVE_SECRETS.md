# Инструкция по удалению секретов из истории Git

GitHub блокирует push из-за секретов в старых коммитах. Есть два варианта решения:

## Вариант 1: Разрешить через веб-интерфейс (Быстро, но не удаляет секреты из истории)

1. Перейдите по ссылкам из ошибки:
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc59uI5R6tff6RwKGLWAKJKO
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36Fzc4DycBs7bTwMipKg2k0ie5Y
   - https://github.com/vidmichd-lab/lug-date/security/secret-scanning/unblock-secret/36FzcApbYN8ZVsxr5zs2w7nlmD9

2. Нажмите "Allow secret" для каждого секрета

3. После этого выполните:
   ```bash
   git push origin develop
   ```

**⚠️ Внимание:** Это разрешит push, но секреты останутся в истории Git. Если репозиторий публичный, секреты будут видны всем.

## Вариант 2: Удалить секреты из истории (Правильно, но сложнее)

Если репозиторий публичный или вы хотите полностью удалить секреты:

1. **Создайте резервную копию:**
   ```bash
   git branch backup-develop
   ```

2. **Используйте git filter-branch для удаления секретов:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch docs/STORAGE_KEYS_SETUP.md ADMIN_DEPLOY_FIX.md ADMIN_DEPLOY_QUICKSTART.md docs/ADMIN_DEPLOY.md scripts/deploy-admin-to-storage.ts" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Или используйте BFG Repo-Cleaner (рекомендуется):**
   ```bash
   # Скачайте BFG: https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --replace-text passwords.txt
   ```

4. **Force push (только если вы уверены!):**
   ```bash
   git push origin --force --all
   ```

**⚠️ Внимание:** Force push перезапишет историю. Убедитесь, что все участники проекта знают об этом.

## Рекомендация

Для приватного репозитория используйте **Вариант 1** (разрешить через веб-интерфейс).
Для публичного репозитория используйте **Вариант 2** (удалить из истории).

