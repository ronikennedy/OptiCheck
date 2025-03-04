import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/_variables.scss';

const Home = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="logo-container">
          <img src="/assets/opticheck-logo.png" alt="OptiCheck" className="logo" />
        </div>
        <h1>OptiCheck</h1>
        <p className="tagline">Facial Recognition Health Monitoring</p>
      </div>

      <div className="auth-section">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        <div className="auth-content">
          {activeTab === 'login' ? (
            <div className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password"
                  className="form-control"
                />
              </div>
              
              <button className="btn btn-primary">Sign In</button>
              
              <div className="form-footer">
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            </div>
          ) : (
            <div className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Enter your full name"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input 
                  type="email" 
                  id="reg-email" 
                  placeholder="Enter your email"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input 
                  type="password" 
                  id="reg-password" 
                  placeholder="Create a password"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  placeholder="Confirm your password"
                  className="form-control"
                />
              </div>
              
              <button className="btn btn-primary">Create Account</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="feature-section">
        <h2>Why Choose OptiCheck?</h2>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <i className="icon-face-recognition"></i>
            </div>
            <h3>Facial Recognition</h3>
            <p>Quickly verify your identity with our secure facial recognition system.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="icon-health"></i>
            </div>
            <h3>Health Monitoring</h3>
            <p>Track vital signs and health metrics through advanced scanning technology.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="icon-cloud"></i>
            </div>
            <h3>Cloud Storage</h3>
            <p>Access your health data securely from anywhere through Google Sheets integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;