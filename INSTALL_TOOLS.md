# 🛠️ Установка инструментов для деплоя

## Быстрая установка

Запустите скрипт установки:

```bash
cd /Users/timitro/Downloads/lug
./scripts/install-tools.sh
```

**Примечание:** Для установки некоторых инструментов (Homebrew, Docker) могут потребоваться права администратора. В этом случае запустите:

```bash
sudo ./scripts/install-tools.sh
```

---

## Ручная установка

Если скрипт не работает, установите инструменты вручную:

### 1. Homebrew (менеджер пакетов для macOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

После установки добавьте в PATH (для Apple Silicon):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Или для Intel Mac:
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

### 2. Node.js и npm

Через Homebrew:
```bash
brew install node
```

Или скачайте установщик с официального сайта:
https://nodejs.org/

### 3. Docker

**Вариант 1:** Docker Desktop (рекомендуется)
- Скачайте: https://www.docker.com/products/docker-desktop
- Установите .dmg файл
- Запустите Docker Desktop из Applications

**Вариант 2:** Через Homebrew
```bash
brew install --cask docker
```

### 4. Yandex Cloud CLI

```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
```

Добавьте в PATH:
```bash
echo 'export PATH=$PATH:$HOME/yandex-cloud/bin' >> ~/.zprofile
source ~/.zprofile
```

Настройте YC CLI:
```bash
yc init
```

---

## Проверка установки

После установки проверьте все инструменты:

```bash
node --version
npm --version
git --version
docker --version
yc version
```

Все команды должны вернуть версии без ошибок.

---

## Следующие шаги

После установки всех инструментов:

1. **Настройте Yandex Cloud CLI:**
   ```bash
   yc init
   ```

2. **Проверьте конфигурацию:**
   ```bash
   yc config list
   ```

3. **Запустите деплой:**
   ```bash
   cd /Users/timitro/Downloads/lug
   ./scripts/deploy-all.sh
   ```

---

## Решение проблем

### Node.js не найден после установки

Перезапустите терминал или выполните:
```bash
source ~/.zprofile
```

### Docker не запускается

1. Убедитесь, что Docker Desktop запущен
2. Проверьте статус: `docker ps`

### YC CLI не найден

Добавьте в PATH вручную:
```bash
export PATH=$PATH:$HOME/yandex-cloud/bin
echo 'export PATH=$PATH:$HOME/yandex-cloud/bin' >> ~/.zprofile
```

---

## Альтернатива: Использование GitHub Actions

Если установка инструментов вызывает проблемы, используйте автоматический деплой через GitHub Actions:

```bash
git add .
git commit -m "Deploy to Yandex Cloud"
git push origin main
```

Подробнее: [DEPLOY_NOW.md](DEPLOY_NOW.md)

