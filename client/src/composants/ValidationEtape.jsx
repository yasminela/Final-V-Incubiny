import React, { useState } from 'react';
import api from '../utils/api';

function ValidationEtape({ etape, porteur, onClose, onSuccess }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidation = async (estValide) => {
    if (!estValide && !feedback) {
      alert(' Veuillez ajouter un feedback pour expliquer le refus');
      return;
    }
  
    setLoading(true);
    try {
      if (estValide) {
        // Valider l'étape
        await api.put(`/etapes/valider/${etape._id}`, { commentaire: feedback });
        alert(` Étape "${etape.titre}" validée avec succès ! L'étape suivante est débloquée.`);
      } else {
        // Refuser l'étape avec feedback
        await api.put(`/etapes/refuser/${etape._id}`, { commentaire: feedback });
        alert(` Étape "${etape.titre}" refusée. Le porteur a été notifié avec votre feedback.`);
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
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
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    header: {
      borderBottom: '2px solid #667eea',
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    title: {
      color: '#667eea',
      fontSize: '24px',
      marginBottom: '5px'
    },
    section: {
      marginBottom: '20px',
      padding: '15px',
      background: '#f7fafc',
      borderRadius: '10px'
    },
    label: {
      fontWeight: 'bold',
      color: '#333',
      display: 'block',
      marginBottom: '5px'
    },
    value: {
      color: '#666',
      lineHeight: '1.5'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      marginTop: '10px',
      fontFamily: 'inherit'
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginTop: '20px'
    },
    btnValider: {
      background: '#10b981',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      flex: 1
    },
    btnRejeter: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      flex: 1
    },
    btnAnnuler: {
      background: '#e2e8f0',
      color: '#333',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      flex: 1
    },
    feedbackRequired: {
      color: '#dc2626',
      fontSize: '12px',
      marginTop: '5px'
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h2 style={styles.title}> Validation d'étape</h2>
        </div>

        <div style={styles.section}>
          <label style={styles.label}> Porteur</label>
          <div style={styles.value}>{porteur?.firstName} {porteur?.lastName}</div>
          <div style={styles.value}> {porteur?.email}</div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}> Étape</label>
          <div style={styles.value}>Étape {etape.numero}/6 : {etape.titre}</div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}> Description</label>
          <div style={styles.value}>{etape.description}</div>
        </div>

        {etape.commentairePorteur && (
          <div style={styles.section}>
            <label style={styles.label}> Commentaire du porteur</label>
            <div style={styles.value}>{etape.commentairePorteur}</div>
          </div>
        )}

        {etape.documentSoumis && (
          <div style={styles.section}>
            <label style={styles.label}>📎 Document soumis</label>
            <div style={styles.value}>
              <a href={`http://localhost:5001/${etape.documentSoumis}`} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                {etape.documentNom || 'Voir le document'}
              </a>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <label style={styles.label}> Feedback {!feedback && ' (obligatoire pour un refus)'}</label>
          <textarea
            style={styles.textarea}
            placeholder="Ajoutez un commentaire pour le porteur..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          {!feedback && <div style={styles.feedbackRequired}> Le feedback est obligatoire en cas de refus</div>}
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.btnValider} onClick={() => handleValidation(true)} disabled={loading}>
            {loading ? 'Traitement...' : ' Valider et débloquer étape suivante'}
          </button>
          <button style={styles.btnRejeter} onClick={() => handleValidation(false)} disabled={loading}>
            {loading ? 'Traitement...' : ' Refuser + envoyer feedback'}
          </button>
          <button style={styles.btnAnnuler} onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default ValidationEtape;