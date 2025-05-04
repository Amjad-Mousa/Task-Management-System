import React, { createContext, useState, useEffect } from 'react';

// 1. إنشاء الـ Context
export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  // 2. الحالة الخاصة بالـ Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 3. قراءة القيمة المخزنة في الـ localStorage عند أول تحميل
  useEffect(() => {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'true');
    }
  }, []);

  // 4. تغيير حالة الـ Dark Mode وتخزينها في الـ localStorage
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
