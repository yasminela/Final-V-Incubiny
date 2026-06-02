import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../composants/Navbar';
import AvatarManager from '../composants/AvatarManager';
import PiedDePage from '../composants/PiedDePage';
import api from '../utils/api';
import Icon from '../composants/Icon';

function Profil({ user, onLogout }) {
  const { darkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    faculte: '',
    residence: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      setCurrentUser(res.data);
      setFormData({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        email: res.data.email || '',
        telephone: res.data.telephone || '',
        faculte: res.data.faculte || '',
        residence: res.data.residence || ''
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/utilisateurs/me', formData);
      alert('Profil mis à jour avec succès');
      loadUserProfile();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };
  
  const styles = {
    container: {
      minHeight: '100vh',
      background: darkMode ? '#0f172a' : '#f8fafc'
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: 'clamp(20px, 5vw, 40px)'
    },
    card: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '24px',
      padding: 'clamp(24px, 5vw, 32px)',
      marginBottom: '24px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderLeft: `4px solid #667eea`,
      paddingLeft: '16px'
    },
    avatarSection: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: darkMode ? '#cbd5e1' : '#475569',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      marginTop: '24px',
      flexWrap: 'wrap'
    },
    saveBtn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cancelBtn: {
      background: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#f1f5f9' : '#475569',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      flexWrap: 'wrap',
      gap: '8px'
    },
    infoLabel: {
      fontWeight: '500',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '13px'
    },
    infoValue: {
      color: darkMode ? '#f1f5f9' : '#1e293b',
      fontSize: '14px'
    },
    roleBadge: {
      background: darkMode ? '#334155' : '#667eea20',
      color: darkMode ? '#a5b4fc' : '#667eea',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      display: 'inline-block'
    }
  };

  return (
    <div style={styles.container}>
      <Navbar user={currentUser} onLogout={onLogout} />
      
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.title}>
            <Icon name="person" size={24} color="#667eea" />
            Mon profil
          </div>

          {/* Section Avatar */}
          <div style={styles.avatarSection}>
            <AvatarManager user={currentUser} onAvatarUpdate={loadUserProfile} />
          </div>

          {/* Informations */}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Faculté / Établissement</label>
              <input
                type="text"
                name="faculte"
                value={formData.faculte}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Résidence / Ville</label>
              <input
                type="text"
                name="residence"
                value={formData.residence}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Rôle</label>
              <div>
                <span style={styles.roleBadge}>
                  {currentUser?.role === 'admin' ? 'Administrateur' : 'Porteur de projet'}
                </span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" disabled={loading} style={styles.saveBtn}>
                <Icon name="save" size={16} color="white" />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <button type="button" onClick={() => window.history.back()} style={styles.cancelBtn}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <PiedDePage />
    </div>
  );
}

export default Profil;