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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = getApiUrl().replace(/\/$/, ''); // Remove trailing slash
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/api/admin/auth/login`);

      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      console.log('📥 Login response received:', {
        status: response.status,
        hasData: !!response.data,
        hasSuccess: response.data?.success,
        hasDataField: !!response.data?.data,
        hasAccessToken: !!response.data?.data?.accessToken,
        responseKeys: response.data ? Object.keys(response.data) : [],
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
      });

      if (response.data.success && response.data.data?.accessToken) {
        const token = response.data.data.accessToken;
        console.log('✅ Login successful, token received:', {
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 20) + '...',
          tokenSuffix: '...' + token.substring(token.length - 10),
        });
        localStorage.setItem('admin_token', token);

        // Verify token was saved
        const savedToken = localStorage.getItem('admin_token');
        console.log('💾 Token saved to localStorage:', {
          saved: savedToken === token,
          savedLength: savedToken?.length,
          savedPrefix: savedToken?.substring(0, 20) + '...',
        });

        onLogin(token);
      } else {
        console.error('❌ Login failed - invalid response structure:', response.data);
        setError(response.data.error?.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('❌ Login error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        hasError: !!err.response?.data?.error,
        errorMessage: err.response?.data?.error?.message,
      });
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
