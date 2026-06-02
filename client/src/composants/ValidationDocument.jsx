import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faFileAlt, faSpinner, faEye } from '@fortawesome/free-solid-svg-icons';

function ValidationDocument({ onValidate }) {
  const { darkMode } = useTheme();
  const [soumissions, setSoumissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [validating, setValidating] = useState({});
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadSoumissions();
  }, []);

  const loadSoumissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/etapes/soumissions');
      console.log('Soumissions chargées:', res.data);
      setSoumissions(res.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id, estValide) => {
    const commentaire = feedback[id] || '';

    if (!estValide && !commentaire) {
      alert('Veuillez ajouter un commentaire pour expliquer le refus');
      return;
    }

    setValidating(prev => ({ ...prev, [id]: true }));

    try {
      if (estValide) {
        await api.put(`/etapes/valider/${id}`, { commentaire });
        alert('Document validé avec succès');
      } else {
        await api.put(`/etapes/refuser/${id}`, { commentaire });
        alert('Document refusé');
      }
      
      await loadSoumissions();
      if (onValidate) onValidate();
      setFeedback({ ...feedback, [id]: '' });
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setValidating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleViewDocument = (soumission) => {
    setSelectedDocument(soumission);
    setShowDocumentModal(true);
  };

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    if (documentPath.startsWith('http')) return documentPath;
    return `http://localhost:5001/${documentPath}`;
  };

  const styles = {
    container: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderLeft: '4px solid #667eea',
      paddingLeft: '16px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    soumissionCard: {
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px'
    },
    soumissionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    soumissionMeta: {
      fontSize: '12px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '4px'
    },
    documentLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: darkMode ? '#334155' : '#f1f5f9',
      padding: '8px 16px',
      borderRadius: '10px',
      color: '#667eea',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: '13px',
      marginTop: '12px',
      marginBottom: '16px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '12px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px'
    },
    buttonGroup: { display: 'flex', gap: '12px', marginTop: '12px' },
    btnValid: {
      background: '#10b981',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    btnRefuse: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    disabledBtn: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    iframe: {
      width: '100%',
      height: '500px',
      border: 'none',
      borderRadius: '10px'
    },
    closeBtn: {
      marginTop: '16px',
      padding: '10px 20px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '100%'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Chargement des soumissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faFileAlt} color="#667eea" />
        Documents à valider ({soumissions.length})
      </div>

      {soumissions.length === 0 ? (
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faFileAlt} size="32px" style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>Aucune soumission en attente</p>
        </div>
      ) : (
        soumissions.map(s => (
          <div key={s._id} style={styles.soumissionCard}>
            <div style={styles.soumissionTitle}>{s.titre}</div>
            <div style={styles.soumissionMeta}>
              Porteur: {s.porteurId?.firstName} {s.porteurId?.lastName} | {s.porteurId?.email}
            </div>
            <div style={styles.soumissionMeta}>
              Soumis le: {new Date(s.dateSoumission).toLocaleDateString('fr-FR')}
            </div>
            
            {s.documentUrl && (
              <div 
                style={styles.documentLink} 
                onClick={() => handleViewDocument(s)}
              >
                <FontAwesomeIcon icon={faEye} />
                Consulter le document soumis
              </div>
            )}

            {s.commentairePorteur && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: darkMode ? '#0f172a' : '#f8fafc', 
                borderRadius: '10px', 
                fontSize: '13px',
                wordWrap: 'break-word'
              }}>
                <strong>Commentaire du porteur:</strong> {s.commentairePorteur}
              </div>
            )}
            
            <textarea
              placeholder="Feedback pour le porteur (obligatoire pour un refus)..."
              value={feedback[s._id] || ''}
              onChange={(e) => setFeedback({ ...feedback, [s._id]: e.target.value })}
              style={styles.textarea}
              rows="3"
            />
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => handleValidation(s._id, true)} 
                disabled={validating[s._id]}
                style={{
                  ...styles.btnValid,
                  ...(validating[s._id] ? styles.disabledBtn : {})
                }}
              >
                {validating[s._id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
                Valider
              </button>
              <button 
                onClick={() => handleValidation(s._id, false)} 
                disabled={validating[s._id]}
                style={{
                  ...styles.btnRefuse,
                  ...(validating[s._id] ? styles.disabledBtn : {})
                }}
              >
                {validating[s._id] ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTimes} />}
                Refuser
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal pour visualiser le document */}
      {showDocumentModal && selectedDocument && (
        <div style={styles.modalOverlay} onClick={() => setShowDocumentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px' }} />
              {selectedDocument.titre}
            </div>
            <div style={{ marginBottom: '16px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Soumis par: {selectedDocument.porteurId?.firstName} {selectedDocument.porteurId?.lastName}
            </div>
            {selectedDocument.documentUrl && (
              <iframe
                src={getDocumentUrl(selectedDocument.documentUrl)}
                style={styles.iframe}
                title="Document"
              />
            )}
            <button style={styles.closeBtn} onClick={() => setShowDocumentModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationDocument;