import React from 'react';
import { Login } from './Login';

export const Register = ({ onSwitchToLogin, onClose, onSuccess, isFullPage = false }) => {
  return (
    <Login
      initialMode="register"
      onSwitchToLogin={onSwitchToLogin}
      onClose={onClose}
      onSuccess={onSuccess}
      isFullPage={isFullPage}
    />
  );
};
