import { createContext, useContext, useEffect, useState } from 'react';

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoSrc, setLogoSrc] = useState('');

  useEffect(() => {
    const storedLogo = localStorage.getItem('siteLogo');
    if (storedLogo) {
      setLogoSrc(storedLogo);
    }
  }, []);

  const updateLogo = (logoDataUrl) => {
    localStorage.setItem('siteLogo', logoDataUrl);
    setLogoSrc(logoDataUrl);
  };

  return (
    <LogoContext.Provider value={{ logoSrc, updateLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => useContext(LogoContext);
