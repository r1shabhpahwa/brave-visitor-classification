import { createSlice } from '@reduxjs/toolkit';

const questionsSlice = createSlice({
  name: 'questions',
  initialState: { questions: [], loading: false, error: null },
  reducers: {
    setQuestions: (state, action) => {
        console.log('Setting Questions:', action.payload); // Log to confirm state update
        state.questions = action.payload;
        state.loading = false;
    },
    setLoading: (state, action) => {
        state.loading = action.payload;
    },
    setError: (state, action) => {
        state.error = action.payload;
        state.loading = false;
    },
  },
});

export const { setQuestions, setLoading, setError } = questionsSlice.actions;
export default questionsSlice.reducer;