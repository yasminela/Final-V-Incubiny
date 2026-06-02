import React, { useState } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

function ValidationProjet({ projet, onClose, onSuccess }) {
  const { darkMode } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleValidation = async (estValide) => {
    if (!estValide && !feedback) {
      alert('Veuillez ajouter un feedback pour expliquer le rejet');
      return;
    }

    setActionType(estValide ? 'valider' : 'rejeter');
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    setShowConfirm(false);
    
    try {
      const estValide = actionType === 'valider';
      
      if (estValide) {
        await api.put(`/projets/valider/${projet._id}`, { feedback });
        alert(`Projet "${projet.titre}" validé avec succès !`);
      } else {
        await api.put(`/projets/rejeter/${projet._id}`, { feedback });
        alert(`Projet "${projet.titre}" rejeté.`);
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      maxWidth: '550px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    header: {
      borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      paddingBottom: '15px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    statutBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#fef3c7',
      color: '#d97706'
    },
    section: {
      marginBottom: '16px',
      padding: '12px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '10px'
    },
    label: {
      fontWeight: 'bold',
      color: darkMode ? '#94a3b8' : '#64748b',
      display: 'block',
      marginBottom: '4px',
      fontSize: '12px'
    },
    value: {
      color: darkMode ? '#e2e8f0' : '#334155',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginTop: '10px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    btnValider: {
      background: '#10b981',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    btnRejeter: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    btnAnnuler: {
      background: '#e2e8f0',
      color: '#475569',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      flex: 1
    },
    confirmOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1100
    },
    confirmContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    confirmButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    btnConfirm: {
      flex: 1,
      padding: '10px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h2 style={styles.title}>Validation du projet</h2>
          <div style={styles.statutBadge}>
            {projet.statut === 'en_attente' ? 'En attente' : 
             projet.statut === 'valide' ? 'Validé' : 'Rejeté'}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Titre du projet</div>
          <div style={styles.value}>{projet.titre || 'Non renseigné'}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Description</div>
          <div style={styles.value}>{projet.description || 'Non renseigné'}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Secteur</div>
          <div style={styles.value}>{projet.secteur || 'Non renseigné'}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Budget</div>
          <div style={styles.value}>{projet.budget ? `${projet.budget.toLocaleString()} €` : 'Non renseigné'}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Porteur du projet</div>
          <div style={styles.value}>
            <strong>{projet.porteurId?.firstName} {projet.porteurId?.lastName}</strong><br />
            {projet.porteurId?.email}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>
            Feedback {!feedback && <span style={{ color: '#ef4444' }}>(obligatoire pour un rejet)</span>}
          </div>
          <textarea
            placeholder="Ajoutez un commentaire pour le porteur..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={styles.textarea}
            rows="3"
          />
        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.btnValider} 
            onClick={() => handleValidation(true)} 
            disabled={loading}
          >
            {loading && actionType === 'valider' ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
            Valider le projet
          </button>
          <button 
            style={styles.btnRejeter} 
            onClick={() => handleValidation(false)} 
            disabled={loading}
          >
            {loading && actionType === 'rejeter' ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTimes} />}
            Demander des modifications
          </button>
          <button style={styles.btnAnnuler} onClick={onClose} disabled={loading}>
            Annuler
          </button>
        </div>
      </div>
      
      {/* Modal de confirmation */}
      {showConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmContent}>
            <h3 style={{ marginBottom: '16px' }}>
              {actionType === 'valider' ? 'Valider le projet' : 'Rejeter le projet'}
            </h3>
            <p>
              {actionType === 'valider' 
                ? 'Êtes-vous sûr de vouloir valider ce projet ?' 
                : 'Êtes-vous sûr de vouloir rejeter ce projet ? Cette action est irréversible.'}
            </p>
            <div style={styles.confirmButtons}>
              <button 
                onClick={confirmAction} 
                style={{ ...styles.btnConfirm, background: '#10b981', color: 'white' }}
              >
                Confirmer
              </button>
              <button 
                onClick={() => setShowConfirm(false)} 
                style={{ ...styles.btnConfirm, background: '#e2e8f0', color: '#475569' }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationProjet;