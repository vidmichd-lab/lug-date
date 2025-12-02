import { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css';

// Get API URL from runtime config or environment variable
const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).ADMIN_CONFIG?.API_URL) {
    return (window as any).ADMIN_CONFIG.API_URL;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
};

export const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = getApiUrl();
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
        username,
        password,
      });

      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('admin_token', response.data.data.token);
        onLogin(response.data.data.token);
      } else {
        setError(response.data.error?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Admin Panel Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className={styles.debugInfo}>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className={styles.clearButton}
          >
            Очистить localStorage и перезагрузить
          </button>
        </div>
      </div>
    </div>
  );
};
