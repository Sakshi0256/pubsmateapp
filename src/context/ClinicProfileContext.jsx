import React, { createContext, useState, useContext } from 'react';

const ClinicProfileContext = createContext();

export const ClinicProfileProvider = ({ children }) => {
  const [clinic, setClinic] = useState({ name: 'Clinic', photo: null });

  const updateClinic = (data) => {
    setClinic((prev) => ({ ...prev, ...data }));
  };

  return (
    <ClinicProfileContext.Provider value={{ clinic, updateClinic }}>
      {children}
    </ClinicProfileContext.Provider>
  );
};

export const useClinicProfile = () => {
  const context = useContext(ClinicProfileContext);
  if (!context) {
    throw new Error('useClinicProfile must be used within a ClinicProfileProvider');
  }
  return context;
};