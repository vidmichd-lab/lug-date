/**
 * Settings Management Page
 */

import React, { useState, useEffect } from 'react';
import { categoriesApi, settingsApi, type Category, type Settings } from '../api/management';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, settingsData] = await Promise.all([
        categoriesApi.getAll(),
        settingsApi.get(),
      ]);
      setCategories(categoriesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategories = async () => {
    try {
      setSaving(true);
      await categoriesApi.update(categories);
      alert('Категории сохранены');
    } catch (error) {
      console.error('Failed to save categories:', error);
      alert('Ошибка при сохранении категорий');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await settingsApi.update(settings);
      alert('Настройки сохранены');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: `category-${Date.now()}`,
        name: '',
        label: '',
        order: categories.length,
        isActive: true,
      },
    ]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  if (loading || !settings) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Настройки приложения</h1>

      <div className={styles.section}>
        <h2>Категории событий</h2>
        <div className={styles.categoriesList}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <input
                type="text"
                placeholder="ID категории"
                value={category.name}
                onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Название"
                value={category.label}
                onChange={(e) => updateCategory(category.id, { label: e.target.value })}
                className={styles.input}
              />
              <input
                type="number"
                placeholder="Порядок"
                value={category.order || 0}
                onChange={(e) =>
                  updateCategory(category.id, { order: parseInt(e.target.value) || 0 })
                }
                className={styles.inputSmall}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={category.isActive !== false}
                  onChange={(e) => updateCategory(category.id, { isActive: e.target.checked })}
                />
                Активна
              </label>
              <button onClick={() => removeCategory(category.id)} className={styles.removeButton}>
                Удалить
              </button>
            </div>
          ))}
          <button onClick={addCategory} className={styles.addButton}>
            + Добавить категорию
          </button>
        </div>
        <button onClick={handleSaveCategories} className={styles.saveButton} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить категории'}
        </button>
      </div>

      <div className={styles.section}>
        <h2>Общие настройки</h2>
        <div className={styles.settingsForm}>
          <label>
            Название приложения:
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className={styles.input}
            />
          </label>
          <div className={styles.row}>
            <label>
              Минимальный возраст:
              <input
                type="number"
                value={settings.minAge}
                onChange={(e) =>
                  setSettings({ ...settings, minAge: parseInt(e.target.value) || 18 })
                }
                className={styles.input}
              />
            </label>
            <label>
              Максимальный возраст:
              <input
                type="number"
                value={settings.maxAge}
                onChange={(e) =>
                  setSettings({ ...settings, maxAge: parseInt(e.target.value) || 100 })
                }
                className={styles.input}
              />
            </label>
          </div>
          <label>
            Города (через запятую):
            <input
              type="text"
              value={settings.cities.join(', ')}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cities: e.target.value
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean),
                })
              }
              className={styles.input}
            />
          </label>
        </div>
        <button onClick={handleSaveSettings} className={styles.saveButton} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
};
