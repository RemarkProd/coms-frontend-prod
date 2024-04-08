import { createContext, useContext, useEffect, useState } from 'react';

const NavItemContext = createContext();

export const NavItemProvider = ({ children }) => {
  //   const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(() => {
    // Initialize menu state with the value from localStorage
    const storedUser = localStorage.getItem('selectedItem');

    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  });

  const setMenuItem = (userInfo) => {
    setSelectedItem(userInfo);
    // Save menu information to localStorage
    localStorage.setItem('selectedItem', JSON.stringify(userInfo));
  };

  const removeMenuItem = () => {
    setSelectedItem(null);
    // Remove menu information from localStorage
    localStorage.removeItem('selectedItem');
  };

  // Optional: If you want to clear localStorage on component unmount
  useEffect(
    () => () => {
      localStorage.removeItem('selectedItem');
    },
    []
  );

  //   return <NavItemContext.Provider value={{ selectedItem, setSelectedItem }}>{children}</NavItemContext.Provider>;
  return (
    <NavItemContext.Provider value={{ selectedItem, setMenuItem, removeMenuItem }}>{children}</NavItemContext.Provider>
  );
};

export const useNavItem = () => useContext(NavItemContext);
