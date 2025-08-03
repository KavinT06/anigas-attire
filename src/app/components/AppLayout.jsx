'use client';
import React from 'react';
import Header from './components/Header';
import ToastContainer, { useToast } from './components/Toast';

const AppLayout = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Header />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {children}
    </>
  );
};

export default AppLayout;
