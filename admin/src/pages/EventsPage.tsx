/**
 * Events Management Page
 */

import React, { useState, useEffect, useRef } from 'react';
import { eventsApi, type Event, type EventCreate } from '../api/management';
import styles from './EventsPage.module.css';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventCreate>({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    location: '',
    date: '',
  });
  const [noDateLimit, setNoDateLimit] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await eventsApi.getAll();
      setEvents(result.data);
    } catch (error: any) {
      console.error('Failed to load events:', error);
      const errorMessage = error?.response?.data?.error?.message 
        || error?.message 
        || 'Ошибка при загрузке событий';
      
      // Show more specific error message
      if (errorMessage.includes('Database not connected')) {
        alert('База данных не подключена. Пожалуйста, настройте подключение к YDB в конфигурации бекенда.');
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
        alert('Не удалось подключиться к API. Убедитесь, что бекенд запущен на http://localhost:4000');
      } else {
        alert(`Ошибка при загрузке событий: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      alert('Пожалуйста, заполните все обязательные поля (Название, Описание, Категория)');
      return;
    }

    try {
      // Prepare data - convert empty strings to undefined for optional fields
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        imageUrl: formData.imageUrl?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        date: formData.date?.trim() || undefined,
      };

      await eventsApi.create(eventData);
      await loadEvents();
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        imageUrl: '',
        location: '',
        date: '',
      });
      setNoDateLimit(false);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      const errorMessage = error?.response?.data?.error?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Ошибка при создании события';
      alert(`Ошибка при создании события: ${errorMessage}`);
    }
  };

  const handleUpdate = async () => {
    if (!editEvent) return;
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      alert('Пожалуйста, заполните все обязательные поля (Название, Описание, Категория)');
      return;
    }

    try {
      // Prepare data - convert empty strings to undefined for optional fields
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        imageUrl: formData.imageUrl?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        date: noDateLimit ? undefined : (formData.date?.trim() || undefined),
      };

      await eventsApi.update(editEvent.id, eventData);
      await loadEvents();
      setEditEvent(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        imageUrl: '',
        location: '',
        date: '',
      });
      setNoDateLimit(false);
    } catch (error: any) {
      console.error('Failed to update event:', error);
      const errorMessage = error?.response?.data?.error?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Ошибка при обновлении события';
      alert(`Ошибка при обновлении события: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это событие?')) return;
    try {
      await eventsApi.delete(id);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Ошибка при удалении события');
    }
  };

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    const hasDate = !!event.date;
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      imageUrl: event.imageUrl || '',
      location: event.location || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    });
    setNoDateLimit(!hasDate);
    setShowCreateForm(true);
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление событиями</h1>
        <div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className={styles.createButton}>
            {showCreateForm ? 'Отмена' : 'Создать событие'}
          </button>
          <button onClick={loadEvents} className={styles.refreshButton}>
            Обновить
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.formPanel}>
          <h2>{editEvent ? 'Редактирование события' : 'Создание события'}</h2>
          <div className={styles.form}>
            <label>
              Название:
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </label>
            <label>
              Описание:
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </label>
            <label>
              Категория:
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </label>
            <label>
              Изображение:
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      alert('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF и т.д.)');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                      return;
                    }
                    
                    // Validate file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                      alert('Размер файла не должен превышать 10MB');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                      return;
                    }
                    
                    try {
                      setImageUploading(true);
                      console.log('Uploading file:', {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        sizeMB: (file.size / 1024 / 1024).toFixed(2),
                      });
                      const result = await eventsApi.uploadImage(file);
                      console.log('Upload successful:', result);
                      setFormData({ ...formData, imageUrl: result.imageUrl });
                    } catch (error: any) {
                      console.error('Failed to upload image:', error);
                      console.error('Error details:', {
                        message: error?.message,
                        response: error?.response?.data,
                        status: error?.response?.status,
                        code: error?.code,
                        config: error?.config,
                      });
                      
                      let errorMessage = 'Ошибка при загрузке изображения';
                      if (error?.code === 'ECONNABORTED') {
                        errorMessage = 'Превышено время ожидания. Попробуйте загрузить файл меньшего размера.';
                      } else if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
                        errorMessage = 'Ошибка сети. Проверьте подключение к интернету и URL API.';
                      } else if (error?.response?.status === 400) {
                        // 400 Bad Request - show detailed error from server
                        const serverError = error?.response?.data?.error;
                        if (serverError?.message) {
                          errorMessage = serverError.message;
                        } else {
                          errorMessage = 'Неверный формат файла или файл слишком большой. Попробуйте другой файл.';
                        }
                      } else if (error?.response?.data?.error?.message) {
                        errorMessage = error.response.data.error.message;
                      } else if (error?.message) {
                        errorMessage = error.message;
                      }
                      
                      alert(`Ошибка при загрузке изображения: ${errorMessage}`);
                    } finally {
                      setImageUploading(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: imageUploading ? 'not-allowed' : 'pointer',
                      opacity: imageUploading ? 0.6 : 1,
                    }}
                  >
                    {imageUploading ? 'Загрузка...' : 'Выбрать файл'}
                  </button>
                  {formData.imageUrl && (
                    <span style={{ fontSize: '14px', color: '#28a745' }}>✓ Изображение загружено</span>
                  )}
                </div>
                {formData.imageUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      style={{
                        marginTop: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Удалить изображение
                    </button>
                  </div>
                )}
              </div>
            </label>
            <label>
              Место:
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </label>
            <label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={noDateLimit}
                  onChange={(e) => {
                    setNoDateLimit(e.target.checked);
                    if (e.target.checked) {
                      setFormData({ ...formData, date: '' });
                    }
                  }}
                />
                <span>Без даты (всегда в ленте)</span>
              </div>
            </label>
            {!noDateLimit && (
              <label>
                Показывать до (дата):
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                  Событие будет показываться в ленте до этой даты включительно
                </small>
              </label>
            )}
            <div className={styles.actions}>
              <button
                onClick={editEvent ? handleUpdate : handleCreate}
                className={styles.saveButton}
              >
                {editEvent ? 'Сохранить' : 'Создать'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditEvent(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    imageUrl: '',
                    location: '',
                    date: '',
                  });
                  setNoDateLimit(false);
                }}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.eventsList}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Место</th>
              <th>Показывать до</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.category}</td>
                <td>{event.location || '-'}</td>
                <td>{event.date ? new Date(event.date).toLocaleDateString('ru-RU') : 'Всегда'}</td>
                <td>
                  <button onClick={() => handleEdit(event)} className={styles.editButton}>
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(event.id)} className={styles.deleteButton}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

