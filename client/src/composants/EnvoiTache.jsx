import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTimes, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';

function EnvoiTache({ onClose, onSuccess }) {
  const { darkMode } = useTheme();
  const [porteurs, setPorteurs] = useState([]);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    porteurId: '',
    dateLimite: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPorteurs();
  }, []);

  const loadPorteurs = async () => {
    try {
      const res = await api.get('/utilisateurs');
      setPorteurs(res.data.filter(u => u.role === 'porteur'));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/taches', formData);
      alert(' Tâche envoyée avec succès');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert(' Erreur: ' + (error.response?.data?.message || error.message));
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
      maxWidth: '500px',
      width: '90%',
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
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      minHeight: '100px',
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer'
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
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.title}>
          <FontAwesomeIcon icon={faPaperPlane} color="#667eea" size="24px" />
          Envoyer une tâche
        </div>
        <div style={styles.subtitle}>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '6px' }} />
          Assignez une tâche à un porteur
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Titre *</label>
            <input
              type="text"
              placeholder="Ex: Compléter le Business Model Canvas"
              value={formData.titre}
              onChange={(e) => setFormData({...formData, titre: e.target.value})}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Description détaillée de la tâche..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Sélectionner un porteur *</label>
            <select
              value={formData.porteurId}
              onChange={(e) => setFormData({...formData, porteurId: e.target.value})}
              required
              style={styles.select}
            >
              <option value="">-- Choisir un porteur --</option>
              {porteurs.map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date limite</label>
            <input
              type="date"
              value={formData.dateLimite}
              onChange={(e) => setFormData({...formData, dateLimite: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Envoi en cours...</>
              ) : (
                <><FontAwesomeIcon icon={faPaperPlane} /> Envoyer</>
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

export default EnvoiTache;