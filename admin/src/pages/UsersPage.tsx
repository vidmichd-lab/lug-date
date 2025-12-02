/**
 * Users Management Page
 */

import React, { useState, useEffect } from 'react';
import { usersApi, type User, type UserUpdate } from '../api/management';
import styles from './UsersPage.module.css';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UserUpdate>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await usersApi.getAll();
      setUsers(result.data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      const errorMessage = error?.response?.data?.error?.message 
        || error?.message 
        || 'Ошибка при загрузке пользователей';
      
      // Show more specific error message
      if (errorMessage.includes('Database not connected')) {
        alert('База данных не подключена. Пожалуйста, настройте подключение к YDB в конфигурации бекенда.');
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
        alert('Не удалось подключиться к API. Убедитесь, что бекенд запущен на http://localhost:4000');
      } else {
        alert(`Ошибка при загрузке пользователей: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      age: user.age,
      photoUrl: user.photoUrl,
      isBanned: user.isBanned,
      isModerated: user.isModerated,
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await usersApi.update(selectedUser.id, editForm);
      await loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Ошибка при обновлении пользователя');
    }
  };

  const handleBan = async (id: string) => {
    if (!confirm('Заблокировать этого пользователя?')) return;
    try {
      await usersApi.update(id, { isBanned: true });
      await loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Ошибка при блокировке пользователя');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление пользователями</h1>
        <button onClick={loadUsers} className={styles.refreshButton}>
          Обновить
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.usersList}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Telegram ID</th>
                <th>Возраст</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id.slice(0, 8)}...</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.telegramId}</td>
                  <td>{user.age || '-'}</td>
                  <td>
                    {user.isBanned && <span className={styles.banned}>Заблокирован</span>}
                    {user.isModerated && <span className={styles.moderated}>Модерирован</span>}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(user)} className={styles.editButton}>
                      Редактировать
                    </button>
                    {!user.isBanned && (
                      <button onClick={() => handleBan(user.id)} className={styles.banButton}>
                        Заблокировать
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className={styles.editPanel}>
            <h2>Редактирование пользователя</h2>
            <div className={styles.form}>
              <label>
                Имя:
                <input
                  type="text"
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </label>
              <label>
                Фамилия:
                <input
                  type="text"
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </label>
              <label>
                Возраст:
                <input
                  type="number"
                  value={editForm.age || ''}
                  onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || undefined })}
                />
              </label>
              <label>
                Био:
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={editForm.isBanned || false}
                  onChange={(e) => setEditForm({ ...editForm, isBanned: e.target.checked })}
                />
                Заблокирован
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={editForm.isModerated || false}
                  onChange={(e) => setEditForm({ ...editForm, isModerated: e.target.checked })}
                />
                Модерирован
              </label>
              <div className={styles.actions}>
                <button onClick={handleSave} className={styles.saveButton}>
                  Сохранить
                </button>
                <button onClick={() => setSelectedUser(null)} className={styles.cancelButton}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


