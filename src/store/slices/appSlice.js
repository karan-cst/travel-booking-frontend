import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sidebarCollapsed: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { setLoading, toggleSidebar, setSidebarCollapsed } = appSlice.actions;
export default appSlice.reducer;
