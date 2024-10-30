export const fetchQuestions = (url) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post('http://localhost:5000/generate-questions', { url });
      dispatch(setQuestions(response.data));
    } catch (err) {
      dispatch(setError('Failed to fetch questions. Please try again.'));
    }
  };