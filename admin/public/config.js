// Runtime configuration for admin panel
// This file is loaded before the app starts
// You can override API URL by setting window.ADMIN_CONFIG before this script loads
window.ADMIN_CONFIG = window.ADMIN_CONFIG || {
  // Backend URL - контейнер Yandex Serverless Containers
  // Этот файл автоматически обновляется при деплое через GitHub Actions
  API_URL: 'https://functions.yandexcloud.net/d4enks8erf8eentnojj9'
};

