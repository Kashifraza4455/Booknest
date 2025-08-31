// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, setCredentials } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const handleLoginSuccess = (userData) => {
    dispatch(loginSuccess(userData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSetCredentials = (userData) => {
    dispatch(setCredentials(userData));
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    handleLoginSuccess,
    handleLogout,
    handleSetCredentials,
  };
};