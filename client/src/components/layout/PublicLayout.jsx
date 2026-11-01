import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import LanguageSwitcher from '../common/LanguageSwitcher';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <LanguageSwitcher variant="floating" />
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
