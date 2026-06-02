import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, faClock, faUpload, faTimesCircle,
  faFilePdf, faSpinner, faEye, faComment, faDownload
} from '@fortawesome/free-solid-svg-icons';

function SuiviEtapes() {
  const { darkMode } = useTheme();
  const [etapes, setEtapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedEtape, setSelectedEtape] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [fichier, setFichier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    loadEtapes();
  }, []);

  const loadEtapes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/etapes/mes-etapes');
      console.log('Étapes chargées:', res.data);
      setEtapes(res.data || []);
    } catch (error) {
      console.error('Erreur chargement étapes:', error);
    } finally {
      setLoading(false);
    }
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!fichier) {
    alert('Veuillez sélectionner un fichier');
    return;
  }

  setUploading(true);
  const formData = new FormData();
  formData.append('fichier', fichier);
  formData.append('etapeId', selectedEtape._id);
  formData.append('commentaire', commentaire);

  try {
    const res = await api.post('/etapes/soumettre', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (res.data.success) {
      alert('Étape soumise avec succès !');
      setShowModal(false);
      setSelectedEtape(null);
      setCommentaire('');
      setFichier(null);
      
      // Recharger les étapes immédiatement
      await loadEtapes();
    }
  } catch (error) {
    console.error('Erreur soumission:', error);
    alert('Erreur: ' + (error.response?.data?.message || error.message));
  } finally {
    setUploading(false);
  }
};

  const handleViewDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(`http://localhost:5001/${documentUrl}`, '_blank');
    }
  };

  const handleViewFeedback = (commentaireAdmin) => {
    setSelectedFeedback(commentaireAdmin);
    setShowFeedbackModal(true);
  };

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'validee':
        return { icon: faCheckCircle, color: '#10b981', text: 'Validée', bg: '#d1fae5' };
      case 'soumise':
        return { icon: faClock, color: '#f59e0b', text: 'En attente de validation', bg: '#fef3c7' };
      case 'refusee':
        return { icon: faTimesCircle, color: '#ef4444', text: 'À reprendre', bg: '#fee2e2' };
      default:
        return { icon: faClock, color: '#64748b', text: 'En attente', bg: '#f1f5f9' };
    }
  };

  const styles = {
    container: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderLeft: '4px solid #667eea',
      paddingLeft: '16px'
    },
    card: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '12px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    cardDescription: {
      fontSize: '14px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    badge: (statut) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      background: getStatutBadge(statut).bg,
      color: getStatutBadge(statut).color
    }),
    actionBtn: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      marginTop: '12px',
      marginRight: '8px',
      transition: 'all 0.3s ease'
    },
    modalOverlay: {
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
      maxWidth: '500px',
      width: '90%'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '16px',
      fontSize: '14px',
      resize: 'vertical'
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '20px'
    },
    buttonGroup: { display: 'flex', gap: '12px' },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    feedbackText: {
      padding: '16px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '10px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    fileInfo: {
      fontSize: '12px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Chargement des étapes...</p>
        </div>
      </div>
    );
  }

  // Filtrer pour ne pas afficher l'étape BMC (car elle est dans l'onglet Analyses IA)
  const bmcEtape = etapes.find(e => e.titre === "Business Model Canvas");
  const autresEtapes = etapes.filter(e => e.titre !== "Business Model Canvas");

  if (autresEtapes.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <FontAwesomeIcon icon={faClock} color="#667eea" />
          Programme Early Stage - Mes étapes
        </div>
        <div style={styles.emptyState}>
          <p>Aucune étape assignée pour le moment</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Les étapes du programme vous seront assignées prochainement par l'administrateur
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faClock} color="#667eea" />
        Programme Early Stage - Mes étapes
        <span style={{ fontSize: '14px', marginLeft: '8px', color: darkMode ? '#94a3b8' : '#64748b' }}>
          ({autresEtapes.length} étape{autresEtapes.length > 1 ? 's' : ''})
        </span>
      </div>

      {autresEtapes.map((etape) => {
        const statutBadge = getStatutBadge(etape.statut);
        return (
          <div key={etape._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                {etape.numero && <span style={{ color: '#667eea', marginRight: '8px' }}>Étape {etape.numero}:</span>}
                {etape.titre}
              </div>
              <div style={styles.badge(etape.statut)}>
                <FontAwesomeIcon icon={statutBadge.icon} />
                {statutBadge.text}
              </div>
            </div>
            
            <div style={styles.cardDescription}>
              {etape.description || 'Aucune description disponible'}
            </div>

            {(etape.statut === 'en_attente' || etape.statut === 'refusee') && (
              <button 
                className="btn-shine" 
                onClick={() => { setSelectedEtape(etape); setShowModal(true); }} 
                style={styles.actionBtn}
              >
                <FontAwesomeIcon icon={faUpload} size="sm" /> Soumettre mon document
              </button>
            )}
            
            {etape.documentUrl && (
              <button onClick={() => handleViewDocument(etape.documentUrl)} style={{ ...styles.actionBtn, background: '#8b5cf6' }}>
                <FontAwesomeIcon icon={faEye} size="sm" /> Voir mon document
              </button>
            )}
            
            {etape.commentaireAdmin && (
              <button onClick={() => handleViewFeedback(etape.commentaireAdmin)} style={{ ...styles.actionBtn, background: '#10b981' }}>
                <FontAwesomeIcon icon={faComment} size="sm" /> Voir le feedback
              </button>
            )}

            {etape.statut === 'soumise' && (
              <div style={styles.fileInfo}>
                <FontAwesomeIcon icon={faSpinner} spin />
                Document en cours de validation...
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de soumission */}
      {showModal && selectedEtape && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faUpload} color="#667eea" />
              Soumettre : {selectedEtape.titre}
            </div>
            
            <div style={styles.fileInfo}>
              <FontAwesomeIcon icon={faFilePdf} />
              Format accepté : PDF, DOC, DOCX, JPG, PNG (max 10 Mo)
            </div>
            
            <form onSubmit={handleSubmit}>
              <textarea
                placeholder="Ajoutez un commentaire pour l'administrateur (optionnel)..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                style={styles.textarea}
                rows="3"
              />
              
              <input
                type="file"
                onChange={(e) => setFichier(e.target.files[0])}
                required
                style={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              
              <div style={styles.buttonGroup}>
                <button type="submit" className="btn-shine" style={styles.actionBtn} disabled={uploading}>
                  {uploading ? <><FontAwesomeIcon icon={faSpinner} spin /> Envoi en cours...</> : <><FontAwesomeIcon icon={faUpload} /> Soumettre</>}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Feedback */}
      {showFeedbackModal && selectedFeedback && (
        <div style={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faComment} color="#10b981" />
              Feedback de l'administrateur
            </div>
            <div style={styles.feedbackText}>{selectedFeedback}</div>
            <button onClick={() => setShowFeedbackModal(false)} style={{ ...styles.actionBtn, width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuiviEtapes;