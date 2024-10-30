import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import images from '../../constants/image';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { setQuestions, setLoading, setError } from '../../questionsSlice';

const socials = [
  {
    logo: images.linkedinIcon,
    alt: 'LinkedIn Icon',
    link: 'https://www.linkedin.com/in/rishabh-pahwa/',
  },
  {
    logo: images.githubIcon,
    alt: 'GitHub Icon',
    link: 'https://github.com/r1shabhpahwa',
  },
];

const SearchSection = () => {
    const dispatch = useDispatch();
    const [url, setURL] = useState('');
    const [showQuestions, setShowQuestions] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const {loading} = useSelector(state => state.questions);
    const questions = useSelector((state) => state.questions.questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [savingResponses, setSavingResponses] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url.trim()) {
          dispatch(setError('Please enter a valid URL.'));
          return;
        }
        dispatch(setLoading(true));
        setCurrentQuestionIndex(0); // Reset the question index
        setResponses([]); // Clear previous responses
        setURL('');
        try {
          const response = await axios.post('http://localhost:5000/generate-questions', { url: url });
          dispatch(setQuestions(response.data));
          setShowQuestions(true);
          setShowSearch(false);
        } catch (err) {
          dispatch(setError('Failed to fetch questions. Please try again.'));
        } finally {
          dispatch(setLoading(false));
        }
    };

    const handleOptionClick = (selectedOption) => {
        setResponses([...responses, { question: questions[currentQuestionIndex].question, response: selectedOption }]);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowQuestions(false);
            postResponses();
        }
    };

    const postResponses = async () => {
        setSavingResponses(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure spinner shows for at least 1 second
            await axios.post('http://localhost:5000/save-responses', { responses });
        } catch (err) {
            console.error('Failed to save responses:', err);
        } finally {
            setSavingResponses(false);
            setShowSearch(true);
        }
    };
  
    return (
        <section id="home" className="bg-white dark:bg-primary">
          <div className="container relative">
            {!showQuestions && showSearch ? (
              <>
                <div className="flex items-center justify-center min-h-screen">
                  <form onSubmit={handleSubmit} className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setURL(e.target.value)}
                      placeholder="Enter the URL"
                      className="url-bar w-full md:w-[600px] lg:w-[800px]"
                    />
                    <button type="submit" className="submit-button">
                    {loading ? (
                        <svg
                        className="animate-spin h-12 w-12 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                        </svg>
                    ) : (
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="submit-icon w-6 h-6"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                        </svg>
                    )}
                    </button>
                  </form>
                </div>
                <div className="w-full relative bottom-20 md:w-auto md:absolute md:top-[70%]">
                  <ul className="flex flex-row justify-center items-center w-full gap-6 md:flex-col">
                    {socials.map((social, index) => (
                      <motion.li
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          default: {
                            duration: 0.3,
                            ease: [0, 0.71, 0.2, 1.01],
                          },
                          scale: {
                            type: 'spring',
                            damping: 5,
                            stiffness: 100,
                            restDelta: 0.001,
                          },
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 1.15 }}
                        key={index}
                        className="bg-neutral w-max rounded-full hover:bg-neutral-300 dark:bg-primary-400 dark:hover:bg-primary-300"
                      >
                        <a href={social.link} target="_blank" rel="noopener noreferrer">
                          <img
                            className="h-14 w-14 p-4 transition-all dark:invert"
                            src={social.logo}
                            alt={social.alt}
                          />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </>
            ) : showQuestions && !showSearch ? (
                <div className="questions-container relative">
                  <div className="flex items-center justify-center min-h-screen">
                    <AnimatePresence mode='wait'>
                      {questions[currentQuestionIndex] && (
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ x: 300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -300, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="question-block-container relative"
                        >
                          <h3 className="question-text-container">{questions[currentQuestionIndex].question}</h3>
                          <ul className="options-list-container">
                            {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                              <li key={optionIndex} className="option-item-container">
                                <button onClick={() => handleOptionClick(option)} className="option-button-container">
                                  {option}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
            ) : (
              <div className="questions-container relative">
                  <div className="flex items-center justify-center min-h-screen"></div></div>
            )}
            {savingResponses && (
            <div className="saving-spinner-container fixed inset-0 flex items-center justify-center">
              <motion.div
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-3xl font-semibold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text bg-[length:200%_200%]"
              >
                Submitting responses
              </motion.div>
            </div>
          )}
          </div>
        </section>
      );
    }

export default SearchSection;
