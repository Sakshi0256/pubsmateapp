import React, { createContext, useState, useContext } from 'react';

const DoctorProfileContext = createContext();

export const DoctorProfileProvider = ({ children }) => {
  const [doctor, setDoctor] = useState({ name: '', photo: '', clinics: [] });

  const updateDoctor = (data) => {
    setDoctor((prev) => ({ ...prev, ...data }));
  };

  return (
    <DoctorProfileContext.Provider value={{ doctor, updateDoctor }}>
      {children}
    </DoctorProfileContext.Provider>
  );
};

export const useDoctorProfile = () => useContext(DoctorProfileContext);