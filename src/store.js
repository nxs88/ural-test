import { configureStore } from '@reduxjs/toolkit';
import partsReducer from './features/partsSlice';

export const store = configureStore({
  reducer: {
    parts: partsReducer,
  },
});
