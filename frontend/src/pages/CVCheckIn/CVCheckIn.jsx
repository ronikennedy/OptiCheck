import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';

const CVCheckIn = () => {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);
  const [recognitionStarted, setRecognitionStarted] = useState(false);
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const videoRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [floatingCircles, setFloatingCircles] = useState([]);
  const [glowingOrbs, setGlowingOrbs] = useState([]);

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setAnimateIn(true);
    
    // Add Comfortaa font if not already added
    if (!document.getElementById('comfortaa-font')) {
      const link = document.createElement('link');
      link.id = 'comfortaa-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    
    // Generate background particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      const animationDuration = 20 + Math.random() * 30;
      const size = 5 + Math.random() * 20;
      const startPosition = Math.random() * 100;
      const startDelay = Math.random() * 5;
      
      newParticles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${startDelay}s`,
        opacity: 0.1 + Math.random() * 0.3,
        animation: `float ${animationDuration}s ease-in-out ${startDelay}s infinite`,
        transformOrigin: 'center center',
        transform: `translate(0, 0) rotate(0deg)`,
        backgroundColor: i % 3 === 0 
          ? 'rgba(111, 226, 204, 0.2)' 
          : i % 3 === 1 
          ? 'rgba(224, 243, 216, 0.15)' 
          : 'rgba(60, 123, 158, 0.15)',
      });
    }
    setParticles(newParticles);
    
    // Generate floating circles
    const newFloatingCircles = [];
    for (let i = 0; i < 10; i++) {
      const size = 100 + Math.random() * 200;
      const animationDuration = 40 + Math.random() * 40;
      const delay = Math.random() * 20;
      
      newFloatingCircles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.05 + Math.random() * 0.05,
        animation: `floatSlow ${animationDuration}s ease-in-out ${delay}s infinite`,
        backgroundColor: i % 2 === 0 
          ? 'rgba(111, 226, 204, 0.05)' 
          : 'rgba(224, 243, 216, 0.05)',
        borderRadius: '50%',
      });
    }
    setFloatingCircles(newFloatingCircles);
    
    // Generate glowing orbs
    const newGlowingOrbs = [];
    for (let i = 0; i < 8; i++) {
      const size = 40 + Math.random() * 30;
      const glowSize = size * (1.5 + Math.random() * 1);
      const colorHue = i % 2 === 0 
        ? '160' // Teal/mint hue
        : '140'; // Green hue
      
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const animationDuration = 15 + Math.random() * 20;
      const glowAnimationDuration = 3 + Math.random() * 3;
      const moveDelay = Math.random() * 5;
      const glowDelay = Math.random() * 3;
      
      newGlowingOrbs.push({
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        background: `hsla(${colorHue}, 70%, 70%, 0.5)`,
        borderRadius: '50%',
        boxShadow: `0 0 ${glowSize}px hsla(${colorHue}, 70%, 60%, 0.7)`,
        animation: `randomMove${i} ${animationDuration}s ease-in-out ${moveDelay}s infinite, glow ${glowAnimationDuration}s ease-in-out ${glowDelay}s infinite alternate`,
        zIndex: '0',
      });
    }
    setGlowingOrbs(newGlowingOrbs);
    
    // Cleanup function for when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Start face recognition process
  const startFaceRecognition = () => {
    setRecognitionStarted(true);
    setScanProgress(0);
    setScanMessage('Initializing camera...');
    
    // Mock the recognition process
    const mockRecognition = () => {
      // Progress simulation
      const interval = setInterval(() => {
        setScanProgress(prevProgress => {
          const newProgress = prevProgress + 2;
          
          // Update scan message based on progress
          if (newProgress === 20) {
            setScanMessage('Detecting faces...');
          } else if (newProgress === 40) {
            setScanMessage('Analyzing facial features...');
          } else if (newProgress === 60) {
            setScanMessage('Matching with database...');
          } else if (newProgress === 80) {
            setScanMessage('Verifying identity...');
          } else if (newProgress >= 100) {
            clearInterval(interval);
            setRecognitionComplete(true);
            // Mock recognized user - in real implementation this would come from your Python backend
            setRecognizedUser({
              name: "Roni Kennedy",
              id: "12345",
              lastCheckIn: "2025-02-28"
            });
            setScanMessage('Recognition complete!');
            return 100;
          }
          
          return newProgress;
        });
      }, 100);
    };
    
    // Access webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Start the mock recognition after camera is initialized
            setTimeout(mockRecognition, 1000);
          }
        })
        .catch(err => {
          console.error("Error accessing webcam:", err);
          setScanMessage('Error: Cannot access camera. Please check permissions.');
        });
    } else {
      setScanMessage('Error: Your browser does not support webcam access.');
    }
  };

  // Handle user confirmation of identity
  const handleConfirmIdentity = () => {
    navigate('/patientverification'); // Navigate to ID verification page
  };
  
  // Handle user denying identity
  const handleDenyIdentity = () => {
    setRecognitionStarted(false);
    setRecognitionComplete(false);
    setRecognizedUser(null);
    setScanProgress(0);
  };
  
  // Handle going back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Generate random movement keyframes for each orb
  const randomMoveKeyframes = glowingOrbs.map((_, index) => {
    const x1 = Math.random() * 30 - 15;
    const y1 = Math.random() * 30 - 15;
    const x2 = Math.random() * 30 - 15;
    const y2 = Math.random() * 30 - 15;
    const x3 = Math.random() * 30 - 15;
    const y3 = Math.random() * 30 - 15;
    
    return `
      @keyframes randomMove${index} {
        0% { transform: translate(-50%, -50%); }
        25% { transform: translate(calc(-50% + ${x1}px), calc(-50% + ${y1}px)); }
        50% { transform: translate(calc(-50% + ${x2}px), calc(-50% + ${y2}px)); }
        75% { transform: translate(calc(-50% + ${x3}px), calc(-50% + ${y3}px)); }
        100% { transform: translate(-50%, -50%); }
      }
    `;
  }).join('\n');

  // Styling
  const styles = {
    checkInPage: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Comfortaa", sans-serif',
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px',
      transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
      opacity: animateIn ? 1 : 0,
      transition: 'transform 0.8s ease, opacity 0.8s ease',
      position: 'relative',
      zIndex: '2',
    },
    logo: {
      width: '80px',
      height: '80px',
      marginBottom: '15px',
      filter: 'drop-shadow(0 0 10px rgba(111, 226, 204, 0.4))',
      objectFit: 'contain',
    },
    title: {
      color: 'white',
      fontSize: '26px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '8px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '16px',
      textAlign: 'center',
      maxWidth: '600px',
    },
    mainContainer: {
      width: '100%',
      maxWidth: '600px',
      transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
      opacity: animateIn ? 1 : 0,
      transition: 'transform 0.8s ease 0.2s, opacity 0.8s ease 0.2s',
      position: 'relative',
      zIndex: '2',
    },
    card: {
      backgroundColor: 'rgba(232, 240, 232, 0.85)', 
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      transform: 'perspective(1000px)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '22px',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
    cardTitle: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '18px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(44, 62, 80, 0.1)',
      color: '#2c3e50',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      transition: 'background-color 0.3s ease',
    },
    cardBody: {
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    videoContainer: {
      width: '100%',
      aspectRatio: '4/3',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
      position: 'relative',
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '12px',
    },
    scanOverlay: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      pointerEvents: 'none',
    },
    scanLine: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '4px',
      background: 'linear-gradient(90deg, transparent, rgba(111, 226, 204, 0.8), transparent)',
      animation: 'scanAnimation 1.5s linear infinite',
      boxShadow: '0 0 8px rgba(111, 226, 204, 0.6)',
    },
    progressContainer: {
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '2px',
      marginBottom: '15px',
    },
    progressBar: {
      height: '100%',
      backgroundColor: 'rgba(111, 226, 204, 0.8)',
      borderRadius: '2px',
      transition: 'width 0.3s ease',
    },
    scanStatus: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    },
    recognitionMessage: {
      fontSize: '16px',
      textAlign: 'center',
      padding: '0 20px',
      marginBottom: '25px',
      color: '#2c3e50',
    },
    recognizedUserInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(111, 226, 204, 0.15)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '25px',
      border: '1px solid rgba(111, 226, 204, 0.3)',
      width: '100%',
    },
    userName: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    userDetail: {
      fontSize: '14px',
      color: '#2c3e50',
      marginBottom: '5px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100%',
      gap: '15px',
    },
    startButton: {
      backgroundColor: 'rgba(111, 226, 204, 0.85)',
      color: '#2c3e50',
      fontSize: '18px',
      fontWeight: '600',
      padding: '14px 30px',
      border: 'none',
      borderRadius: '100px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(111, 226, 204, 0.4), 0 0 0 1px rgba(111, 226, 204, 0.2) inset',
      width: '100%',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    confirmButton: {
      backgroundColor: 'rgba(111, 226, 204, 0.85)',
      color: '#2c3e50',
      fontSize: '16px',
      fontWeight: '600',
      padding: '12px 25px',
      border: 'none',
      borderRadius: '100px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(111, 226, 204, 0.4), 0 0 0 1px rgba(111, 226, 204, 0.2) inset',
      width: '100%',
      outline: 'none',
    },
    cancelButton: {
      backgroundColor: 'rgba(231, 76, 60, 0.85)',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      padding: '12px 25px',
      border: 'none',
      borderRadius: '100px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4), 0 0 0 1px rgba(231, 76, 60, 0.2) inset',
      width: '100%',
      outline: 'none',
    },
    backgroundElement: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1',
    },
    particle: {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    floatingCircle: {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    glowingOrb: {
      position: 'absolute',
      pointerEvents: 'none',
    }
  };

  return (
    <div style={styles.checkInPage}>
      {/* Background elements */}
      <div style={styles.backgroundElement}>
        {/* Floating circles */}
        {floatingCircles.map((circle, index) => (
          <div 
            key={`circle-${index}`} 
            style={{
              ...styles.floatingCircle,
              ...circle,
            }} 
          />
        ))}
        
        {/* Particles */}
        {particles.map((particle, index) => (
          <div 
            key={`particle-${index}`} 
            style={{
              ...styles.particle,
              ...particle,
            }} 
          />
        ))}
        
        {/* Glowing orbs */}
        {glowingOrbs.map((orb, index) => (
          <div 
            key={`orb-${index}`} 
            style={{
              ...styles.glowingOrb,
              ...orb,
            }} 
          />
        ))}
      </div>
      
      {/* Header */}
      <div style={styles.headerContainer}>
        <img src={logoImage} alt="OptiCheck" style={styles.logo} />
        <h1 style={styles.title}>Identity Verification</h1>
        <p style={styles.subtitle}>
          We'll use facial recognition to verify your identity and access your health profile.
        </p>
      </div>
      
      {/* Main content */}
      <div style={styles.mainContainer}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Facial Recognition</div>
            <button 
              style={styles.backButton}
              onClick={handleBackToHome}
              aria-label="Back to home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div style={styles.cardBody}>
            {!recognitionStarted ? (
              <>
                <div style={{
                  ...styles.videoContainer,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.6}}>
                    <path d="M15 8H15.01M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12Z" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12.5C2 11.6716 2.67157 11 3.5 11C4.32843 11 5 11.6716 5 12.5V15C5 18.3137 7.68629 21 11 21H13C16.3137 21 19 18.3137 19 15V12.5C19 11.6716 19.6716 11 20.5 11C21.3284 11 22 11.6716 22 12.5V15C22 19.4183 18.4183 23 14 23H10C5.58172 23 2 19.4183 2 15V12.5Z" fill="#2c3e50"/>
                    <path d="M12.5 4C12.5 3.17157 11.8284 2.5 11 2.5C10.1716 2.5 9.5 3.17157 9.5 4V11C9.5 11.8284 10.1716 12.5 11 12.5C11.8284 12.5 12.5 11.8284 12.5 11V4Z" fill="#2c3e50"/>
                    <path d="M14.5 4C14.5 3.17157 15.1716 2.5 16 2.5C16.8284 2.5 17.5 3.17157 17.5 4V8C17.5 8.82843 16.8284 9.5 16 9.5C15.1716 9.5 14.5 8.82843 14.5 8V4Z" fill="#2c3e50"/>
                    <path d="M7.5 4C7.5 3.17157 6.82843 2.5 6 2.5C5.17157 2.5 4.5 3.17157 4.5 4V8C4.5 8.82843 5.17157 9.5 6 9.5C6.82843 9.5 7.5 8.82843 7.5 8V4Z" fill="#2c3e50"/>
                  </svg>
                </div>
                
                <p style={styles.recognitionMessage}>
                  To begin the identity verification process, please click the button below and position your face within the camera frame.
                </p>
                
                <div style={styles.buttonContainer}>
                  <button 
                    style={styles.startButton}
                    onClick={startFaceRecognition}
                  >
                    Start Face Recognition
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.videoContainer}>
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={styles.video}
                  />
                  {!recognitionComplete && (
                    <div style={styles.scanOverlay}>
                      <div style={styles.scanLine}></div>
                      <div style={styles.progressContainer}>
                        <div style={{
                          ...styles.progressBar,
                          width: `${scanProgress}%`,
                        }}></div>
                      </div>
                      <div style={styles.scanStatus}>{scanMessage}</div>
                    </div>
                  )}
                </div>
                
                {recognitionComplete && recognizedUser && (
                  <>
                    <div style={styles.recognitionMessage}>
                      <span style={{fontWeight: 'bold', color: '#2ecc71'}}>✓ Identity Matched</span>
                      <br />
                      We've successfully identified you. Please confirm this is correct.
                    </div>
                    
                    <div style={styles.recognizedUserInfo}>
                      <div style={styles.userName}>{recognizedUser.name}</div>
                      <div style={styles.userDetail}>ID: {recognizedUser.id}</div>
                      <div style={styles.userDetail}>Last Check-in: {recognizedUser.lastCheckIn}</div>
                    </div>
                    
                    <div style={styles.buttonContainer}>
                      <button 
                        style={styles.confirmButton}
                        onClick={handleConfirmIdentity}
                      >
                        Yes, this is me
                      </button>
                      <button 
                        style={styles.cancelButton}
                        onClick={handleDenyIdentity}
                      >
                        No, try again
                      </button>
                    </div>
                  </>
                )}
                
                {!recognitionComplete && (
                  <div style={styles.recognitionMessage}>
                    Please maintain a neutral expression and ensure good lighting during the scan.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes float {
            0% {
              transform: translate(0px, 0px) rotate(0deg);
            }
            25% {
              transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 20 - 10}deg);
            }
            50% {
              transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 20 - 10}deg);
            }
            75% {
              transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 20 - 10}deg);
            }
            100% {
              transform: translate(0px, 0px) rotate(0deg);
            }
          }
          
          @keyframes floatSlow {
            0% {
              transform: translate(0px, 0px) scale(1);
              opacity: 0.03;
            }
            33% {
              transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(${1 + Math.random() * 0.2});
              opacity: 0.06;
            }
            66% {
              transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(${1 + Math.random() * 0.2});
              opacity: 0.08;
            }
            100% {
              transform: translate(0px, 0px) scale(1);
              opacity: 0.03;
            }
          }
          
          @keyframes glow {
            0% {
              opacity: 0.4;
              box-shadow: 0 0 10px hsla(160, 70%, 60%, 0.5);
            }
            100% {
              opacity: 0.8;
              box-shadow: 0 0 30px hsla(160, 70%, 60%, 0.8);
            }
          }
          
          @keyframes scanAnimation {
            0% { transform: translateY(0%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(0%); }
          }
          
          ${randomMoveKeyframes}
          
          button:focus {
            outline: none;
          }
          
          body {
            font-family: 'Comfortaa', sans-serif;
          }
        `}
      </style>
    </div>
  );
};

export default CVCheckIn;