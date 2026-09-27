import { createContext, useContext, useEffect, useState } from 'react';

const TextColorContext = createContext();

export const TextColorProvider = ({ children }) => {
  const [textColor, setTextColor] = useState('#0B0B0B');

  useEffect(() => {
    const storedColor = localStorage.getItem('textColor');
    if (storedColor) {
      setTextColor(storedColor);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--text', textColor);
    document.documentElement.style.setProperty('--text-h', textColor);
    localStorage.setItem('textColor', textColor);
  }, [textColor]);

  return (
    <TextColorContext.Provider value={{ textColor, setTextColor }}>
      {children}
    </TextColorContext.Provider>
  );
};

export const useTextColor = () => useContext(TextColorContext);
