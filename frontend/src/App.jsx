import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import CVCheckIn from './pages/CVCheckIn/CVCheckIn';
import PatientVerification from './pages/PatientVerification/PatientVerification';
import VitalsResults from './pages/VitalsResults/VitalsResults';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cvcheckin" element={<CVCheckIn />} />
          <Route path="/patientverification" element={<PatientVerification />} />
          <Route path="/vitalsresults" element={<VitalsResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;