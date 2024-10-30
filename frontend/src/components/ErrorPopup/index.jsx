// components/ErrorPopup.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../../questionsSlice';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorPopup = () => {
  const error = useSelector((state) => state.questions.error);
  const dispatch = useDispatch();

  // Automatically hide the popup after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(setError(null));
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer if the component unmounts
    }
  }, [error, dispatch]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className="error-popup"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            className="w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="flex-grow">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;
