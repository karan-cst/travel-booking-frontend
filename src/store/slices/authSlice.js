import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  // Safe check for SSR environment
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (token && user) {
        return {
          user,
          role: user.role || 'user',
          token,
          isAuthenticated: true,
        };
      }
    } catch (e) {
      console.error('Error hydrating auth state:', e);
    }
  }
  return {
    user: null,
    role: null,
    token: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.role = user?.role || 'user';
      state.token = token;
      state.isAuthenticated = !!token;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('token');
          const userRaw = localStorage.getItem('user');
          const user = userRaw ? JSON.parse(userRaw) : null;
          if (token && user) {
            state.user = user;
            state.role = user.role || 'user';
            state.token = token;
            state.isAuthenticated = true;
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
});

export const { setCredentials, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
