import React from 'react';
import { Route } from 'react-router-dom';
import UsersPage from '../pages/Users/UsersPage';

export const usersRoutes = [
  <Route key="users" path="/users" element={<UsersPage />} />
];