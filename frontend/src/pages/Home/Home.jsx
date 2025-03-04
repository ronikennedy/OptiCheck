import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import logoIconImage from '../../assets/logo.png'; // Using the same logo for the check icon

const Home = () => {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);
  const [particles, setParticles] = useState([]);
  const [floatingCircles, setFloatingCircles] = useState([]);
  const [glowingOrbs, setGlowingOrbs] = useState([]);
  
  useEffect(() => {
    // Trigger entrance animations after component mounts
    setAnimateIn(true);
    
    // Add Comfortaa font
    if (!document.getElementById('comfortaa-font')) {
      const link = document.createElement('link');
      link.id = 'comfortaa-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    
    // Generate particles
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
      const moveRange = 30 + Math.random() * 50;
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
    
  }, []);
  
  const handleCheckIn = () => {
    navigate('/cvcheckin');
  };

  // Advanced styles with animations and modern UI elements
  const styles = {
    homePage: {
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
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '40px',
      transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
      opacity: animateIn ? 1 : 0,
      transition: 'transform 0.8s ease, opacity 0.8s ease',
      position: 'relative',
      zIndex: '2',
    },
    logo: {
      width: '140px',
      height: '140px',
      marginBottom: '20px',
      filter: 'drop-shadow(0 0 10px rgba(111, 226, 204, 0.4))',
      objectFit: 'contain',
    },
    welcomeText: {
      color: 'white',
      fontSize: '28px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '12px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      fontFamily: '"Comfortaa", sans-serif',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '16px',
      fontWeight: '400',
      textAlign: 'center',
      fontFamily: '"Comfortaa", sans-serif',
    },
    cardContainer: {
      width: '100%',
      maxWidth: '500px',
      transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
      opacity: animateIn ? 1 : 0,
      transition: 'transform 0.8s ease 0.2s, opacity 0.8s ease 0.2s',
      position: 'relative',
      zIndex: '2',
    },
    checkInCard: {
      backgroundColor: 'rgba(232, 240, 232, 0.85)', // More transparent for blur effect
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      backdropFilter: 'blur(15px)', // Increased blur effect
      WebkitBackdropFilter: 'blur(15px)', // For Safari
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
    cardBadge: {
      display: 'flex',
      alignItems: 'center',
    },
    checkIconContainer: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      // Removed background, border, and shadow properties
    },
    modernCheck: {
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '18px',
      fontFamily: '"Comfortaa", sans-serif',
    },
    infoCircle: {
      width: '28px',
      height: '28px',
      backgroundColor: 'rgba(111, 226, 204, 0.15)',
      color: '#2c3e50',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontStyle: 'italic',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
      border: '1px solid rgba(111, 226, 204, 0.2)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
    },
    cardBody: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '50px 20px',
    },
    checkInButton: {
      backgroundColor: 'rgba(111, 226, 204, 0.85)',
      color: '#2c3e50',
      fontSize: '22px',
      fontWeight: '600',
      padding: '18px 50px',
      border: 'none',
      borderRadius: '100px', // More rounded for modern look
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(111, 226, 204, 0.4), 0 0 0 1px rgba(111, 226, 204, 0.2) inset',
      position: 'relative',
      overflow: 'hidden',
      width: '90%',
      maxWidth: '280px',
      outline: 'none',
      fontFamily: '"Comfortaa", sans-serif',
      backdropFilter: 'blur(10px)', // Button blur effect
      WebkitBackdropFilter: 'blur(10px)', // For Safari
    },
    buttonGlow: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'radial-gradient(circle at center, rgba(111, 226, 204, 0.4) 0%, rgba(111, 226, 204, 0) 70%)',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
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
    particles: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '0',
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

  return (
    <div style={styles.homePage}>
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
      
      <div style={styles.logoContainer}>
        {/* Use the imported logo */}
        <img src={logoImage} alt="OptiCheck" style={styles.logo} />
        <div style={styles.welcomeText}>Welcome to OptiCheck</div>
        <div style={styles.subtitle}>UHealth Medical Center</div>
      </div>
      
      <div style={styles.cardContainer}>
        <div style={styles.checkInCard}>
          <div style={styles.cardHeader}>
            <div style={styles.cardBadge}>
              <div style={styles.checkIconContainer}>
                <div style={styles.modernCheck}>
                  {/* Use the imported logo image for the check icon */}
                  <img 
                    src={logoIconImage}
                    alt="OptiCheck" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
              </div>
              <span style={styles.badgeText}>OptiCheck</span>
            </div>
            <div style={styles.infoCircle}>i</div>
          </div>
          
          <div style={styles.cardBody}>
            <button 
              style={{
                ...styles.checkInButton,
                transform: `scale(${animateIn ? 1 : 0.95})`,
                opacity: animateIn ? 1 : 0,
              }}
              onClick={handleCheckIn}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(127, 245, 223, 0.9)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(111, 226, 204, 0.6), 0 0 0 1px rgba(111, 226, 204, 0.3) inset, 0 0 30px rgba(111, 226, 204, 0.4)';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                // Add glow effect
                e.currentTarget.querySelector('.button-glow').style.opacity = '1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(111, 226, 204, 0.85)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(111, 226, 204, 0.4), 0 0 0 1px rgba(111, 226, 204, 0.2) inset';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                // Remove glow effect
                e.currentTarget.querySelector('.button-glow').style.opacity = '0';
              }}
            >
              Check-In
              <div className="button-glow" style={styles.buttonGlow}></div>
            </button>
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

export default Home;