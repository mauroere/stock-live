import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { usersRoutes } from './users.routes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      {usersRoutes}
    </Routes>
  );
};

export default AppRoutes;