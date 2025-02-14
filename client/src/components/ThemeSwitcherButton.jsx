import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

function getSystemTheme() {
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || getSystemTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button onClick={toggleTheme} className="btn btn-circle bg-base-200 hover:bg-base-300">
      {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
    </button>
  );
};

export default ThemeToggle;
