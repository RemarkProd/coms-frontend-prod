import 'bootstrap/dist/css/bootstrap.min.css';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
// routes
// import { useState } from 'react';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';

import { NavItemProvider } from './context/NavContext';
import { UserProvider } from './context/UserContext';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <ScrollToTop />
          <StyledChart />
          <UserProvider>
            <NavItemProvider>
              <Router />
            </NavItemProvider>
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
