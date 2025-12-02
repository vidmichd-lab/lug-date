# Container Registry Permissions Fix

## Проблема: Permission Denied при Push

Ошибка `denied: Permission denied` при попытке push Docker образа в Yandex Container Registry.

## Решение

### Шаг 1: Получить необходимые ID

```bash
# Service Account ID из JSON ключа
cat yc-service-account-key.json | jq -r '.service_account_id'
# Или: ajer4q84m7bno0lp0ucq

# Folder ID (из конфига или реестра)
yc config get folder-id
# Или: b1g6rst3sps7hhu8tqla

# Registry ID
yc container registry list
# Или: crpe7m04ge3tl5vr8kgj
```

### Шаг 2: Добавить роль сервис-аккаунту

```bash
# Минимальная роль для push
yc resource-manager folder add-access-binding b1g6rst3sps7hhu8tqla \
  --role container-registry.images.pusher \
  --subject serviceAccount:ajer4q84m7bno0lp0ucq

# Или полные права (если нужны)
yc resource-manager folder add-access-binding b1g6rst3sps7hhu8tqla \
  --role editor \
  --subject serviceAccount:ajer4q84m7bno0lp0ucq
```

### Шаг 3: Проверить доступ

```bash
# Проверить список реестров
yc container registry list

# Настроить Docker
yc container registry configure-docker --folder-id b1g6rst3sps7hhu8tqla
```

## Текущая конфигурация

- **Service Account ID**: `ajer4q84m7bno0lp0ucq`
- **Folder ID**: `b1g6rst3sps7hhu8tqla`
- **Registry ID**: `crpe7m04ge3tl5vr8kgj`
- **Role**: `container-registry.images.pusher` ✅

## Проверка в GitHub Actions

Workflow автоматически:
1. Проверяет наличие `REGISTRY_ID`
2. Настраивает Docker с `--folder-id`
3. Проверяет доступ к реестру
4. Показывает детальную диагностику при ошибках

## Troubleshooting

### Если всё ещё Permission Denied

1. **Проверить, что реестр в той же папке:**
   ```bash
   yc container registry get --id crpe7m04ge3tl5vr8kgj --format json | jq '.folder_id'
   ```

2. **Проверить роли сервис-аккаунта:**
   ```bash
   yc resource-manager folder list-access-bindings b1g6rst3sps7hhu8tqla \
     --format json | jq '.bindings[] | select(.subject.id == "ajer4q84m7bno0lp0ucq")'
   ```

3. **Использовать скрипт проверки:**
   ```bash
   npm run check:registry-permissions
   ```

4. **Проверить JSON ключ в GitHub Secrets:**
   - Должен быть полный JSON с переносами строк
   - Не должен быть минифицирован

## Полезные команды

```bash
# Проверить текущие роли
yc resource-manager folder list-access-bindings <FOLDER_ID> \
  --format json | jq '.bindings[] | select(.subject.id == "<SERVICE_ACCOUNT_ID>")'

# Удалить роль (если нужно)
yc resource-manager folder remove-access-binding <FOLDER_ID> \
  --role container-registry.images.pusher \
  --subject serviceAccount:<SERVICE_ACCOUNT_ID>

# Добавить роль editor (полные права)
yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role editor \
  --subject serviceAccount:<SERVICE_ACCOUNT_ID>
```

