import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, faLock, faEye, faEyeSlash, faRocket, 
  faChartLine, faUsers, faLightbulb, faArrowRight, faSpinner
} from '@fortawesome/free-solid-svg-icons';

function Connexion({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoHover, setLogoHover] = useState(false);
  const navigate = useNavigate();

  // Animation des particules
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Vérifier si déjà connecté
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user && user !== 'undefined') {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/porteur');
        }
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
    
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 10 + 5
      });
    }
    setParticles(newParticles);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Connexion réussie:', user.email);
      
      if (onLogin) {
        onLogin(user, token);
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/porteur', { replace: true });
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    circle1: {
      position: 'absolute',
      top: '-20%',
      right: '-10%',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      animation: 'float1 15s ease-in-out infinite'
    },
    circle2: {
      position: 'absolute',
      bottom: '-20%',
      left: '-10%',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
      animation: 'float2 20s ease-in-out infinite'
    },
    circle3: {
      position: 'absolute',
      top: '50%',
      left: '30%',
      width: '250px',
      height: '250px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      animation: 'float3 12s ease-in-out infinite'
    },
    particle: (left, top, size, delay, duration) => ({
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      background: 'rgba(255,255,255,0.4)',
      borderRadius: '50%',
      left: `${left}%`,
      top: `${top}%`,
      animation: `floatParticle ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }),
    card: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '440px',
      margin: '20px',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '32px',
      padding: '44px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logoContainer: {
      marginBottom: '24px',
      cursor: 'pointer'
    },
    logo: {
      width: '80px',
      height: '80px',
      margin: '0 auto',
      transition: 'all 0.3s ease',
      transform: logoHover ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
      filter: logoHover ? 'drop-shadow(0 10px 20px rgba(102,126,234,0.4))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))'
    },
    logoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      borderRadius: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#334155',
      marginBottom: '8px'
    },
    inputWrapper: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      fontSize: '16px'
    },
    input: {
      width: '100%',
      padding: '14px 14px 14px 42px',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundColor: '#f8fafc',
      color: '#1e293b'  // ← AJOUT : couleur du texte en noir/gris foncé
    },
    inputPlaceholder: {
      color: '#94a3b8'  // ← AJOUT : couleur du placeholder
    },
    passwordToggle: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#94a3b8'
    },
    btnLogin: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '13px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    features: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px solid #e2e8f0'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      color: '#64748b'
    },
    footer: {
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '11px',
      color: '#94a3b8'
    }
  };

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-30px, -20px) rotate(10deg); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(40px, 20px) rotate(-10deg); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -15px) scale(1.1); }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            75% { transform: translateY(10px) translateX(-10px); }
          }
          input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102,126,234,0.3);
          }
          /* Style pour le placeholder */
          input::placeholder {
            color: #94a3b8;
          }
        `
      }} />

      {/* Cercles décoratifs */}
      <div style={styles.circle1} />
      <div style={styles.circle2} />
      <div style={styles.circle3} />

      {/* Particules */}
      {particles.map(p => (
        <div key={p.id} style={styles.particle(p.left, p.top, p.size, p.delay, p.duration)} />
      ))}

      {/* Formulaire */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div 
            style={styles.logoContainer}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <div style={styles.logo}>
              <img 
                src="/logo-incubiny.png" 
                alt="Incubiny" 
                style={styles.logoImg}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23667eea" rx="20"/%3E%3Ctext x="50" y="68" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EI%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
          <h1 style={styles.title}>Incubiny</h1>
          <p style={styles.subtitle}>Plateforme d'incubation de startups</p>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <FontAwesomeIcon icon={faEnvelope} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@incubiny.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.inputWrapper}>
              <FontAwesomeIcon icon={faLock} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
              <div style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={styles.btnLogin}
            disabled={loading}
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Connexion en cours...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faRocket} />
                Se connecter
                <FontAwesomeIcon icon={faArrowRight} size="sm" />
              </>
            )}
          </button>
        </form>

        <div style={styles.features}>
          <div style={styles.feature}>
            <FontAwesomeIcon icon={faChartLine} size="xs" />
            <span>Suivi temps réel</span>
          </div>
          <div style={styles.feature}>
            <FontAwesomeIcon icon={faUsers} size="xs" />
            <span>Accompagnement</span>
          </div>
          <div style={styles.feature}>
            <FontAwesomeIcon icon={faLightbulb} size="xs" />
            <span>Analyses IA</span>
          </div>
        </div>

        <div style={styles.footer}>
          © 2026 Incubiny - Tous droits réservés
        </div>
      </div>
    </div>
  );
}

export default Connexion;