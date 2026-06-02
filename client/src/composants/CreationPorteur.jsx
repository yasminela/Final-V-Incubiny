import React, { useState } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTimes, faSpinner, faEnvelope, faLock, faPhone, faGraduationCap, faHome } from '@fortawesome/free-solid-svg-icons';

function CreationPorteur({ onClose, onSuccess }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    telephone: '',
    faculte: '',
    residence: '',
    nomProjet: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/utilisateurs', formData);
      alert(' Porteur créé avec succès');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };
  
  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    },
    modalContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '24px',
      padding: 'clamp(20px, 5vw, 32px)',
      maxWidth: '550px',
      width: '90%',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '14px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: darkMode ? '#e2e8f0' : '#475569',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      transition: 'all 0.2s ease'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      flex: 1,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    cancelBtn: {
      background: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#f1f5f9' : '#475569',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      flex: 1,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    errorMsg: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '12px',
      marginBottom: '20px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.title}>
          <FontAwesomeIcon icon={faUserPlus} color="#667eea" size="24px" />
          Créer un porteur
        </div>
        <div style={styles.subtitle}>
          Ajoutez un nouveau porteur de projet
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Prénom *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Prénom du porteur"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Nom du porteur"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '6px' }} />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="email@exemple.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faLock} style={{ marginRight: '6px' }} />
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Mot de passe"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faPhone} style={{ marginRight: '6px' }} />
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+216 XX XXX XXX"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '6px' }} />
              Faculté / Établissement
            </label>
            <input
              type="text"
              name="faculte"
              value={formData.faculte}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nom de l'établissement"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faHome} style={{ marginRight: '6px' }} />
              Résidence / Ville
            </label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ville de résidence"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom du projet</label>
            <input
              type="text"
              name="nomProjet"
              value={formData.nomProjet}
              onChange={handleChange}
              style={styles.input}
              placeholder="Titre du projet"
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Création en cours...</>
              ) : (
                <><FontAwesomeIcon icon={faUserPlus} /> Créer le porteur</>
              )}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreationPorteur;