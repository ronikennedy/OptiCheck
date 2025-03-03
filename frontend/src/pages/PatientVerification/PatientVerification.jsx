import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';

const PatientVerification = () => {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);
  const [idCaptured, setIdCaptured] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [particles, setParticles] = useState([]);
  const [floatingCircles, setFloatingCircles] = useState([]);
  const [glowingOrbs, setGlowingOrbs] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

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
    
    // Start camera access on component mount
    startCamera();
    
    // Cleanup function for when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Access webcam
  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
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

  // Capture ID from video
  const captureID = () => {
    setIdCaptured(false);
    setScanProgress(0);
    setScanMessage('Scanning ID...');
    
    // Mock the ID capture and verification process
    const interval = setInterval(() => {
      setScanProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        
        // Update scan message based on progress
        if (newProgress === 20) {
          setScanMessage('Detecting ID document...');
        } else if (newProgress === 40) {
          setScanMessage('Reading information...');
        } else if (newProgress === 60) {
          setScanMessage('Verifying ID details...');
        } else if (newProgress === 80) {
          setScanMessage('Matching with facial data...');
        } else if (newProgress >= 100) {
          clearInterval(interval);
          setScanMessage('Verification complete!');
          
          // Take a snapshot from video for demonstration
          if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Add a simulated ID card outline overlay
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 4;
            ctx.strokeRect(canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.7, canvas.height * 0.6);
            
            // Add some text to simulate detected info
            ctx.fillStyle = '#2ecc71';
            ctx.font = '16px Comfortaa';
            ctx.fillText('ID Verified ✓', canvas.width * 0.15, canvas.height * 0.15);
          }
          
          setIdCaptured(true);
          setTimeout(() => {
            setVerificationComplete(true);
          }, 1000);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
  };
  
  // Handle proceeding to vitals
  const handleProceedToVitals = () => {
    navigate('/vitalsresults');
  };
  
  // Handle going back to face recognition
  const handleBackToRecognition = () => {
    navigate('/cvcheckin');
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
    verificationPage: {
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
      display: idCaptured ? 'none' : 'block',
    },
    canvas: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '12px',
      display: idCaptured ? 'block' : 'none',
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
    idGuide: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '70%',
      height: '60%',
      border: '2px dashed rgba(111, 226, 204, 0.8)',
      borderRadius: '8px',
      pointerEvents: 'none',
      display: idCaptured ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    idGuideText: {
      color: 'white',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '4px',
      maxWidth: '80%',
    },
    progressContainer: {
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '2px',
      marginBottom: '15px',
      display: scanProgress > 0 && !idCaptured ? 'block' : 'none',
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
      display: scanProgress > 0 && !idCaptured ? 'block' : 'none',
    },
    verificationMessage: {
      fontSize: '16px',
      textAlign: 'center',
      padding: '0 20px',
      marginBottom: '25px',
      color: '#2c3e50',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      gap: '15px',
    },
    scanButton: {
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
    proceedButton: {
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
    },
    successIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'rgba(46, 204, 113, 0.15)',
      marginBottom: '15px',
    }
  };

  return (
    <div style={styles.verificationPage}>
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
        <h1 style={styles.title}>ID Verification</h1>
        <p style={styles.subtitle}>
          Please hold your ID card up to the camera for verification
        </p>
      </div>
      
      {/* Main content */}
      <div style={styles.mainContainer}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>ID Document Scan</div>
            <button 
              style={styles.backButton}
              onClick={handleBackToRecognition}
              aria-label="Back to face recognition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div style={styles.cardBody}>
            <div style={styles.videoContainer}>
              <video 
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={styles.video}
              />
              <canvas 
                ref={canvasRef}
                style={styles.canvas}
              />
              
              {!idCaptured && (
                <div style={styles.idGuide}>
                  <div style={styles.idGuideText}>
                    Position ID card within the frame
                  </div>
                </div>
              )}
              
              <div style={styles.scanOverlay}>
                <div style={styles.progressContainer}>
                  <div style={{
                    ...styles.progressBar,
                    width: `${scanProgress}%`,
                  }}></div>
                </div>
                <div style={styles.scanStatus}>{scanMessage}</div>
              </div>
            </div>
            
            {verificationComplete ? (
              <>
                <div style={styles.successIcon}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div style={styles.verificationMessage}>
                  <span style={{fontWeight: 'bold', color: '#2ecc71'}}>Verification Successful</span>
                  <br />
                  Your ID has been verified. You can now proceed to vitals monitoring.
                </div>
                
                <div style={styles.buttonContainer}>
                  <button 
                    style={styles.proceedButton}
                    onClick={handleProceedToVitals}
                  >
                    Continue to Vitals Monitoring
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.verificationMessage}>
                  {idCaptured ? 
                    "Processing ID information..." : 
                    "Hold your ID card steady and ensure all details are visible. Please ensure good lighting for optimal scanning."}
                </div>
                
                {!idCaptured && (
                  <div style={styles.buttonContainer}>
                    <button 
                      style={styles.scanButton}
                      onClick={captureID}
                    >
                      Scan ID Card
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
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

export default PatientVerification;