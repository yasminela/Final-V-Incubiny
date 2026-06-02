import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function AvatarManager({ user, onAvatarUpdate, size = 'small' }) {
  const { darkMode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setCurrentAvatar(user?.avatar || null);
  }, [user?.avatar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getColorFromEmail = () => {
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];
    if (!user?.email) return colors[0];
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
      hash = ((hash << 5) - hash) + user.email.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(' Veuillez sélectionner une image (JPEG, PNG, GIF)');
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
      setCurrentAvatar(res.data.avatar);
      if (onAvatarUpdate) onAvatarUpdate(res.data.avatar);
      alert(' Photo de profil mise à jour !');
      setShowMenu(false);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(' Erreur lors de l\'upload: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm(' Supprimer votre photo de profil ?')) return;
    
    setUploading(true);
    try {
      await api.delete('/utilisateurs/avatar');
      setCurrentAvatar(null);
      if (onAvatarUpdate) onAvatarUpdate(null);
      alert(' Photo supprimée');
      setShowMenu(false);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(' Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const sizeStyles = {
    small: { width: '32px', height: '32px', fontSize: '14px' },
    medium: { width: '50px', height: '50px', fontSize: '20px' },
    large: { width: '80px', height: '80px', fontSize: '32px' }
  };

  const currentSize = sizeStyles[size] || sizeStyles.small;

  const styles = {
    container: { position: 'relative', display: 'inline-block' },
    avatarWrapper: {
      position: 'relative',
      cursor: 'pointer',
      borderRadius: '50%',
      overflow: 'hidden'
    },
    avatarImage: {
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}`
    },
    avatarPlaceholder: {
      width: currentSize.width,
      height: currentSize.height,
      borderRadius: '50%',
      background: getColorFromEmail(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: 'white',
      ...currentSize
    },

overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s',
  borderRadius: '50%'
},
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%'
},
    menu: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px',
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '160px',
      overflow: 'hidden',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    menuItem: {
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '13px',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      transition: 'background 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    menuItemDanger: {
      color: '#ef4444'
    }
  };

  const getAvatarUrl = () => {
    if (currentAvatar) {
      if (currentAvatar.startsWith('http')) {
        return currentAvatar;
      }
      return `http://localhost:5001${currentAvatar}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const hasAvatar = !!avatarUrl;

  return (
    <div style={styles.container}>
      <div 
        style={styles.avatarWrapper}
        onClick={() => !uploading && setShowMenu(!showMenu)}
        onMouseEnter={(e) => {
          if (!uploading && e.currentTarget.querySelector('.overlay')) {
            e.currentTarget.querySelector('.overlay').style.opacity = '1';
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading && e.currentTarget.querySelector('.overlay')) {
            e.currentTarget.querySelector('.overlay').style.opacity = '0';
          }
        }}
      >
        {hasAvatar ? (
          <img src={avatarUrl} alt="Avatar" style={styles.avatarImage} />
        ) : (
          <div style={styles.avatarPlaceholder}>{getInitials()}</div>
        )}
        <div className="overlay" style={styles.overlay}>
          <span>📷</span>
        </div>
        {uploading && (
          <div style={styles.loadingOverlay}>
            <span>⏳</span>
          </div>
        )}
      </div>

      {showMenu && !uploading && (
        <div style={styles.menu} ref={menuRef}>
          <div style={styles.menuItem} onClick={() => fileInputRef.current?.click()}>
             Changer la photo
          </div>
          {hasAvatar && (
            <div style={{ ...styles.menuItem, ...styles.menuItemDanger }} onClick={handleDeleteAvatar}>
               Supprimer
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
}

export default AvatarManager;