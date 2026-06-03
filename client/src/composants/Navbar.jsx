import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faCamera, faTrashAlt, faSignOutAlt, faBars, faTimes, faChevronDown, faChevronUp, faBell, faPlayCircle
} from '@fortawesome/free-solid-svg-icons';

function Navbar({ user, onLogout }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserProfile();
    loadNotifications();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setNotificationsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setNotificationsMenuOpen(false);
  }, [location]);

  const openVideoDemo = () => {
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  const loadUserProfile = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications/mes-notifications');
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.estLue).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const marquerCommeLue = async (id) => {
    try {
      await api.put(`/notifications/${id}/lire`);
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, estLue: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const marquerToutCommeLu = async () => {
    try {
      await api.put('/notifications/marquer-tout-lu');
      setNotifications(prev => prev.map(n => ({ ...n, estLue: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleChangePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setProfileMenuOpen(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(' Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(' L\'image ne doit pas dépasser 2 Mo');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.put('/utilisateurs/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCurrentUser(prev => ({ ...prev, avatar: res.data.avatar }));
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.avatar = res.data.avatar;
      localStorage.setItem('user', JSON.stringify(storedUser));
      alert('Photo mise à jour !');
    } catch (error) {
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Supprimer votre photo ?')) return;

    setUploading(true);
    try {
      await api.delete('/utilisateurs/avatar');
      setCurrentUser(prev => ({ ...prev, avatar: null }));
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.avatar = null;
      localStorage.setItem('user', JSON.stringify(storedUser));
      alert('Photo supprimée');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setUploading(false);
      setProfileMenuOpen(false);
    }
  };

  const getInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.firstName) return currentUser.firstName[0].toUpperCase();
    if (currentUser?.email) return currentUser.email[0].toUpperCase();
    return 'U';
  };

  const getAvatarUrl = () => {
    if (currentUser?.avatar) {
      if (currentUser.avatar.startsWith('http')) return currentUser.avatar;
      return `http://localhost:5001${currentUser.avatar}`;
    }
    return null;
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMins = Math.floor((now - notifDate) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return notifDate.toLocaleDateString('fr-FR');
  };

  const avatarUrl = getAvatarUrl();
  const hasAvatar = !!avatarUrl;

  const styles = {
    nav: {
      background: scrolled 
        ? (darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)')
        : (darkMode ? '#1e293b' : 'white'),
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      padding: scrolled ? '10px 24px' : '14px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
    },
    navContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer'
    },
    logo: { height: '36px', width: '36px', objectFit: 'contain' },
    logoText: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: darkMode ? '#f1f5f9' : '#667eea'
    },
    desktopMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    demoBtn: {
      background: darkMode ? '#334155' : '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    themeBtn: {
      background: darkMode ? '#334155' : '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center'
    },
    notificationContainer: { position: 'relative' },
    notificationBtn: {
      position: 'relative',
      background: darkMode ? '#334155' : '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      minWidth: '18px',
      height: '18px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      padding: '0 4px'
    },
    notificationPanel: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '380px',
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      zIndex: 1100,
      overflow: 'hidden',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    notificationHeader: {
      padding: '12px 16px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'bold'
    },
    notificationList: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    notificationItem: (estLue) => ({
      padding: '12px 16px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      background: estLue ? 'transparent' : (darkMode ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)'),
      cursor: 'pointer'
    }),
    emptyNotifications: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    profileContainer: { 
      position: 'relative'
    },
    profileBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '6px 14px',
      borderRadius: '40px',
      background: darkMode ? '#334155' : '#f1f5f9',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}`
    },
    avatarPlaceholder: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    mobileMenuBtn: {
      display: 'none',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: darkMode ? '#f1f5f9' : '#475569'
    },
    mobileMenuOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 999
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '280px',
      height: '100vh',
      background: darkMode ? '#1e293b' : 'white',
      zIndex: 1000,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    mobileMenuHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '16px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    mobileMenuItem: {
      padding: '12px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '22px',
      cursor: 'pointer',
      color: darkMode ? '#f1f5f9' : '#475569'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      cursor: 'pointer'
    },
    modalContent: {
      position: 'relative',
      width: '90%',
      maxWidth: '1000px',
      background: '#000',
      borderRadius: '16px',
      overflow: 'hidden'
    },
    closeModalBtn: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.7)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      color: 'white',
      fontSize: '20px',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iframe: {
      width: '100%',
      height: '500px',
      border: 'none'
    }
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logoContainer} onClick={() => navigate('/')}>
            <img src="/logo-incubiny.png" alt="Incubiny" style={styles.logo} onError={(e) => e.target.style.display = 'none'} />
            <h2 style={styles.logoText}>Incubiny</h2>
          </div>

          <div style={styles.desktopMenu}>
            {/* Bouton Démo Vidéo */}
            <button className="btn-shine" onClick={openVideoDemo} style={styles.demoBtn}>
              <FontAwesomeIcon icon={faPlayCircle} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: darkMode ? '#f1f5f9' : '#1e293b' }}>Démo</span>
            </button>

            <button onClick={toggleDarkMode} style={styles.themeBtn}>
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            </button>

            {/* NOTIFICATIONS */}
            <div style={styles.notificationContainer} ref={notificationsMenuRef}>
              <button style={styles.notificationBtn} onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}>
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
              </button>
              {notificationsMenuOpen && (
                <div style={styles.notificationPanel}>
                  <div style={styles.notificationHeader}>
                    <span> Notifications</span>
                    {unreadCount > 0 && <button onClick={marquerToutCommeLu} style={{ color: '#667eea', background: 'none', border: 'none', cursor: 'pointer' }}>Tout marquer comme lu</button>}
                  </div>
                  <div style={styles.notificationList}>
                    {notifications.length === 0 ? (
                      <div style={styles.emptyNotifications}>Aucune notification</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} style={styles.notificationItem(notif.estLue)} onClick={() => marquerCommeLue(notif._id)}>
                          <div>{notif.message}</div>
                          <div style={{ fontSize: '11px', color: darkMode ? '#64748b' : '#94a3b8', marginTop: '4px' }}>{formatDate(notif.createdAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFIL MENU */}
            <div style={styles.profileContainer} ref={profileMenuRef}>
              <button 
                onClick={() => {
                  console.log(' Bouton profil cliqué');
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                style={styles.profileBtn}
              >
                {hasAvatar ? (
                  <img src={avatarUrl} alt="Avatar" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>{getInitials()}</div>
                )}
                <span style={styles.userName}>{currentUser?.firstName || 'User'}</span>
                <FontAwesomeIcon icon={profileMenuOpen ? faChevronUp : faChevronDown} style={{ fontSize: '12px' }} />
              </button>

              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  width: '220px',
                  backgroundColor: darkMode ? '#1e293b' : 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 99999,
                  overflow: 'hidden',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                }}>
                  <div 
                    onClick={() => {
                      handleChangePhoto();
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      color: darkMode ? '#f1f5f9' : '#1e293b',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FontAwesomeIcon icon={faCamera} style={{ width: '16px' }} />
                    <span>Changer la photo</span>
                  </div>
                  
                  {hasAvatar && (
                    <div 
                      onClick={() => {
                        handleDeletePhoto();
                        setProfileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        color: darkMode ? '#f1f5f9' : '#1e293b',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} style={{ width: '16px' }} />
                      <span>Supprimer la photo</span>
                    </div>
                  )}
                  
                  <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '0' }} />
                  
                  <div 
                    onClick={() => {
                      handleLogout();
                      setProfileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      color: '#ef4444',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '16px' }} />
                    <span>Déconnexion</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setMobileMenuOpen(true)} style={styles.mobileMenuBtn}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </nav>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      {mobileMenuOpen && (
        <>
          <div style={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)} />
          <div style={styles.mobileMenu}>
            <div style={styles.mobileMenuHeader}>
              <img src="/logo-incubiny.png" alt="Logo" style={{ height: '32px' }} />
              <button onClick={() => setMobileMenuOpen(false)} style={styles.closeBtn}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div style={{ ...styles.mobileMenuItem, display: 'flex', alignItems: 'center', gap: '12px', background: darkMode ? '#334155' : '#f1f5f9' }}>
              {hasAvatar ? <img src={avatarUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{getInitials()}</div>}
              <div><div style={{ fontWeight: 'bold' }}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{ fontSize: '11px', opacity: 0.7 }}>{currentUser?.email}</div></div>
            </div>
            <div className="btn-shine" style={styles.mobileMenuItem} onClick={openVideoDemo}>
              <FontAwesomeIcon icon={faPlayCircle} /> Démo vidéo
            </div>
            <div style={styles.mobileMenuItem} onClick={handleChangePhoto}><FontAwesomeIcon icon={faCamera} /> Changer la photo</div>
            {hasAvatar && <div style={styles.mobileMenuItem} onClick={handleDeletePhoto}><FontAwesomeIcon icon={faTrashAlt} /> Supprimer la photo</div>}
            <div style={styles.mobileMenuItem} onClick={toggleDarkMode}><FontAwesomeIcon icon={darkMode ? faSun : faMoon} /> {darkMode ? 'Mode clair' : 'Mode sombre'}</div>
            <div style={{ ...styles.mobileMenuItem, marginTop: 'auto', color: '#ef4444' }} onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion</div>
          </div>
        </>
      )}

      {/* Modal Vidéo Démo - Google Drive */}
      {showVideoModal && (
        <div style={styles.modalOverlay} onClick={closeVideoModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeModalBtn} onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <iframe
              src="https://drive.google.com/file/d/1sclBEdnXmzq-8VJfIAtxs2SZBPfDr9XG/preview"
              width="100%"
              height="500"
              allow="autoplay"
              allowFullScreen
              style={styles.iframe}
              title="Démo Incubiny"
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .btn-shine { position: relative; overflow: hidden; transition: all 0.3s ease; }
          .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s ease; }
          .btn-shine:hover::before { left: 100%; }
          .btn-shine:hover { transform: translateY(-2px); }
          @media (max-width: 768px) { .desktop-menu { display: none !important; } }
        `
      }} />
    </>
  );
}

export default Navbar;