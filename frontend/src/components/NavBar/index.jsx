import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { motion } from "framer-motion";
import useDarkMode from "../../hooks/useDarkMode";
import { setQuestions, setLoading, setError } from '../../questionsSlice';

const navlinks = [
  {
    name: "Repository",
    href: "https://github.com/r1shabhpahwa/visitor-classification",
  },
  {
    name: "Contact Me",
    href: "mailto:rishabhpahwa@gmail.com",
  },
];

export default function NavBar() {
  const [darkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!darkTheme);
  const dispatch = useDispatch();
  const [addBlur, setAddBlur] = useState(false);

  const addBlurScroll = () => {
    if (window.scrollY >= 100) {
      setAddBlur(true);
    } else {
      setAddBlur(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", addBlurScroll);
    return () => {
      window.removeEventListener("scroll", addBlurScroll);
    };
  }, []);

  const handleGetCsv = async () => {
    try {
      const response = await fetch("https://brave-backend.p1xelhub.xyz/get_csv", {
        method: "GET",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "responses.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error("Failed to download CSV");
        dispatch(setError('Failed to download CSV.'));
      }
    } catch (error) {
      console.error("Error fetching CSV:", error);
      dispatch(setError('Failed to fetch API'));
    }
  };

  return (
    <div
      className={` ${
        addBlur && "drop-shadow-lg backdrop-blur-md"
      } fixed top-0 w-full z-[100] transition-all duration-300`}
    >
      <motion.div
        viewport={{ once: true }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "linear", duration: 0.5 }}
        className="container"
      >
        <div className="flex justify-end items-center px-0 py-4 gap-4 sm:px-6 lg:py-8 lg:gap-10">
          <nav className="hidden space-x-6 lg:flex lg:space-x-10">
            {navlinks.map((navlink) => (
              <a
                key={navlink.name}
                href={navlink.href}
                className={
                  navlink.href
                    ? "text-base font-medium text-primary relative before:absolute before:-bottom-1 before:h-0.5 before:w-full before:scale-x-0 before:transition before:bg-primary hover:before:scale-x-100 dark:hover:text-neutral dark:text-white dark:before:bg-secondary"
                    : "text-base font-medium text-primary relative dark:text-white dark:before:bg-secondary cursor-not-allowed"
                }
              >
                {navlink.name}
              </a>
            ))}
            <button
              onClick={handleGetCsv}
              className="text-base font-medium text-primary relative before:absolute before:-bottom-1 before:h-0.5 before:w-full before:scale-x-0 before:transition before:bg-primary hover:before:scale-x-100 dark:hover:text-neutral dark:text-white dark:before:bg-secondary"
            >
              Download Response
            </button>
          </nav>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              default: {
                duration: 0.3,
                ease: [0, 0.71, 0.2, 1.01],
              },
              scale: {
                type: "spring",
                damping: 5,
                stiffness: 100,
                restDelta: 0.001,
              },
            }}
            whileTap={{ y: -5 }}
            className="text-primary hidden transition-opacity lg:block dark:text-white"
            onClick={handleMode}
          >
            {darkTheme ? (
              <SunIcon className="h-6 w-6 cursor-pointer opacity-100" />
            ) : (
              <MoonIcon className="h-6 w-6 cursor-pointer opacity-100" />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
