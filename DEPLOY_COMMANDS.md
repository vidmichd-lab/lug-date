# 🚀 Команды для деплоя

## ⚡ Быстрый способ

Выполните в терминале (все команды подряд):

```bash
cd /Users/timitro/Downloads/lug

# Добавить Homebrew в PATH
eval "$(/opt/homebrew/bin/brew shellenv)"

# Авторизоваться в GitHub
gh auth login

# Запушить изменения (запустит автоматический деплой)
git push origin main
```

## 📋 Пошагово

### Шаг 1: Добавить Homebrew в PATH

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Или добавьте в ~/.zshrc навсегда:**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Шаг 2: Авторизация в GitHub

```bash
gh auth login
```

Следуйте инструкциям:
- Выберите `GitHub.com`
- Выберите `HTTPS` или `SSH`
- Следуйте дальнейшим инструкциям

### Шаг 3: Push изменений

```bash
git push origin main
```

Это автоматически запустит деплой через GitHub Actions!

## 🔍 Проверка

После push проверьте статус:
**https://github.com/vidmichd-lab/lug-date/actions**

## 💡 Альтернатива: без GitHub CLI

Если не хотите использовать GitHub CLI:

1. **Создайте Personal Access Token:**
   - https://github.com/settings/tokens
   - Создайте token с правами `repo`
   - Скопируйте token

2. **Выполните push:**
   ```bash
   git push origin main
   ```
   - Username: ваш GitHub username
   - Password: вставьте Personal Access Token

---

**Готово!** 🎉

