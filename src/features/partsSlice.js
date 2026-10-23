import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  number: '',
  brand: '',
  manufacturers: [],
  results: [],
  loading: false,
  error: null,
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setNumber: (state, action) => {
      state.number = action.payload;
    },
    setBrand: (state, action) => {
      state.brand = action.payload;
    },
    setManufacturers: (state, action) => {
      state.manufacturers = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNumber,
  setBrand,
  setManufacturers,
  setResults,
  setLoading,
  setError,
} = partsSlice.actions;

export default partsSlice.reducer;
