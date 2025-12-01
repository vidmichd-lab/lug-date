/**
 * Events Management Page
 */

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await eventsApi.create(formData);
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
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Ошибка при создании события');
    }
  };

  const handleUpdate = async () => {
    if (!editEvent) return;
    try {
      await eventsApi.update(editEvent.id, formData);
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
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Ошибка при обновлении события');
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
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      imageUrl: event.imageUrl || '',
      location: event.location || '',
      date: event.date || '',
    });
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
              URL изображения:
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
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
              Дата:
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </label>
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
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.category}</td>
                <td>{event.location || '-'}</td>
                <td>{event.date ? new Date(event.date).toLocaleDateString() : '-'}</td>
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

