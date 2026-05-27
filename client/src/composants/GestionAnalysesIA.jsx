import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faEye, faSpinner, faComment, 
  faCheckCircle, faInfoCircle, faLightbulb,
  faDownload, faFileAlt, faRobot, faUserCheck,
  faCalendar, faClock, faStar, faTrophy,
  faUpload, faFilePdf, faCheck, faTimes,
  faArrowRight, faThumbsUp, faExclamationTriangle,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

function GestionAnalysesIA() {
  const { darkMode } = useTheme();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // État pour l'upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyseResult, setAnalyseResult] = useState(null);
  const [showAnalyseModal, setShowAnalyseModal] = useState(false);
  const [mentorsRecommandes, setMentorsRecommandes] = useState([]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ai/mes-analyses');
      if (res.data && Array.isArray(res.data)) {
        setAnalyses(res.data);
      } else {
        setAnalyses([]);
      }
    } catch (error) {
      console.error('Erreur chargement analyses:', error);
      setError(error.response?.data?.message || 'Erreur de connexion');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyse = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      alert('Le fichier doit être au format PDF');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('bmc', selectedFile);

    try {
      const res = await api.post('/ai/analyser-bmc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      if (res.data.success) {
        setAnalyseResult(res.data);
        setMentorsRecommandes(res.data.mentorsRecommandes || []);
        setShowAnalyseModal(true);
        setSelectedFile(null);
        loadAnalyses();
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleViewDetails = (analyse) => {
    setSelectedDetails(analyse);
    setShowDetailsModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return { text: 'Excellent', icon: faTrophy, color: '#fbbf24' };
    if (score >= 60) return { text: 'Très bien', icon: faThumbsUp, color: '#10b981' };
    if (score >= 40) return { text: 'Bon', icon: faChartLine, color: '#3b82f6' };
    return { text: 'À améliorer', icon: faExclamationTriangle, color: '#ef4444' };
  };

  const formatFeedback = (feedback) => {
    if (!feedback) return [];
    
    const lines = feedback.split('\n');
    const sections = [];
    
    lines.forEach(line => {
      if (line.startsWith('✅')) {
        sections.push({ type: 'success', text: line.substring(2).trim() });
      } else if (line.startsWith('❌')) {
        sections.push({ type: 'error', text: line.substring(2).trim() });
      } else if (line.startsWith('📌')) {
        sections.push({ type: 'info', text: line.substring(2).trim() });
      } else if (line.startsWith('⚠️')) {
        sections.push({ type: 'warning', text: line.substring(2).trim() });
      } else if (line.trim()) {
        sections.push({ type: 'neutral', text: line.trim() });
      }
    });
    
    return sections;
  };

  const getNiveauStars = (niveau) => {
    if (!niveau) niveau = 0;
    const fullStars = Math.min(5, Math.max(0, niveau));
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
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
    uploadSection: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: `2px dashed ${darkMode ? '#475569' : '#cbd5e1'}`
    },
    uploadTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    uploadSubtitle: {
      fontSize: '13px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '20px'
    },
    fileInput: {
      display: 'block',
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '16px',
      cursor: 'pointer'
    },
    analyseBtn: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    analyseBtnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    selectedFileInfo: {
      marginTop: '12px',
      padding: '10px',
      background: darkMode ? '#1e293b' : '#e2e8f0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    analyseCard: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    analyseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '16px'
    },
    analyseTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    scoreBadge: (score) => ({
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      background: getScoreColor(score) + '20',
      color: getScoreColor(score)
    }),
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
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
      borderRadius: '24px',
      padding: '28px',
      maxWidth: '700px',
      width: '90%',
      maxHeight: '85vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      paddingBottom: '16px'
    },
    scoreContainer: {
      textAlign: 'center',
      padding: '24px',
      borderRadius: '20px',
      marginBottom: '24px'
    },
    scoreValue: {
      fontSize: '56px',
      fontWeight: 'bold'
    },
    scoreLevel: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    feedbackSection: {
      marginBottom: '24px'
    },
    feedbackTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    feedbackItem: (type) => ({
      padding: '10px 14px',
      marginBottom: '8px',
      borderRadius: '10px',
      fontSize: '14px',
      lineHeight: '1.5',
      background: type === 'success' ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5') :
                type === 'error' ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2') :
                type === 'warning' ? (darkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7') :
                (darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
      color: type === 'success' ? '#10b981' :
             type === 'error' ? '#ef4444' :
             type === 'warning' ? '#f59e0b' :
             (darkMode ? '#e2e8f0' : '#334155'),
      borderLeft: `3px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#667eea'}`
    }),
    recommandationCard: {
      padding: '12px 16px',
      marginBottom: '10px',
      background: darkMode ? '#0f172a' : '#fef3c7',
      borderRadius: '12px',
      borderLeft: `4px solid #f59e0b`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    },
    mentorCard: {
      padding: '12px 16px',
      marginBottom: '10px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    },
    closeBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 'bold',
      marginTop: '24px'
    }
  };

  const scoreLevel = analyseResult ? getScoreLevel(analyseResult.scoreImpact) : null;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faRobot} color="#667eea" />
        Analyse IA de mon Business Model Canvas
      </div>

      {/* SECTION UPLOAD */}
      <div style={styles.uploadSection}>
        <div style={styles.uploadTitle}>
          <FontAwesomeIcon icon={faUpload} color="#667eea" />
          Nouvelle analyse
        </div>
        <div style={styles.uploadSubtitle}>
          Téléchargez votre Business Model Canvas (PDF) pour obtenir une analyse complète
        </div>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={styles.fileInput}
        />

        {selectedFile && (
          <div style={styles.selectedFileInfo}>
            <span><FontAwesomeIcon icon={faFilePdf} style={{ marginRight: '8px', color: '#ef4444' }} />{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <button
          onClick={handleAnalyse}
          disabled={!selectedFile || uploading}
          style={{
            ...styles.analyseBtn,
            ...((!selectedFile || uploading) ? styles.analyseBtnDisabled : {})
          }}
        >
          {uploading ? (
            <><FontAwesomeIcon icon={faSpinner} spin /> Analyse en cours...</>
          ) : (
            <><FontAwesomeIcon icon={faRobot} /> Analyser mon BMC</>
          )}
        </button>
      </div>

      {/* HISTORIQUE */}
      <div style={{ ...styles.title, marginTop: '24px' }}>
        <FontAwesomeIcon icon={faChartLine} color="#667eea" />
        Historique des analyses
      </div>

      {analyses.length === 0 ? (
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faChartLine} size="48px" style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>Aucune analyse effectuée pour le moment</p>
        </div>
      ) : (
        analyses.map((analyse) => (
          <div key={analyse._id} style={styles.analyseCard} onClick={() => handleViewDetails(analyse)}>
            <div style={styles.analyseHeader}>
              <div style={styles.analyseTitle}>
                <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px' }} />
                Analyse du {new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR')}
              </div>
              <div style={styles.scoreBadge(analyse.scoreImpact)}>
                Score: {analyse.scoreImpact}/100
              </div>
            </div>
            <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              {analyse.feedback?.substring(0, 100)}...
            </div>
          </div>
        ))
      )}

      {/* MODAL RÉSULTAT ANALYSE AVEC MENTORS */}
      {showAnalyseModal && analyseResult && (
        <div style={styles.modalOverlay} onClick={() => setShowAnalyseModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faRobot} color="#667eea" />
              🤖 Résultat de l'analyse
            </div>

            <div style={{ ...styles.scoreContainer, background: getScoreColor(analyseResult.scoreImpact) + '15' }}>
              <div style={{ ...styles.scoreValue, color: getScoreColor(analyseResult.scoreImpact) }}>
                {analyseResult.scoreImpact}/100
              </div>
              {scoreLevel && (
                <div style={styles.scoreLevel}>
                  <FontAwesomeIcon icon={scoreLevel.icon} style={{ color: scoreLevel.color }} />
                  <span style={{ color: scoreLevel.color }}>{scoreLevel.text}</span>
                </div>
              )}
            </div>

            <div style={styles.feedbackSection}>
              <div style={styles.feedbackTitle}>
                <FontAwesomeIcon icon={faComment} color="#667eea" />
                Analyse détaillée
              </div>
              {formatFeedback(analyseResult.feedback).map((item, idx) => (
                <div key={idx} style={styles.feedbackItem(item.type)}>
                  {item.type === 'success' && <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />}
                  {item.type === 'error' && <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />}
                  {item.type === 'warning' && <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />}
                  {item.type === 'info' && <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />}
                  {item.text}
                </div>
              ))}
            </div>

            {analyseResult.recommandations && analyseResult.recommandations.length > 0 && (
              <div>
                <div style={styles.feedbackTitle}>
                  <FontAwesomeIcon icon={faLightbulb} color="#f59e0b" />
                  Recommandations personnalisées
                </div>
                {analyseResult.recommandations.slice(0, 5).map((rec, i) => (
                  <div key={i} style={styles.recommandationCard}>
                    <FontAwesomeIcon icon={faArrowRight} color="#f59e0b" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 🌟 SECTION MENTORS RECOMMANDÉS 🌟 */}
            {mentorsRecommandes.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={styles.feedbackTitle}>
                  <FontAwesomeIcon icon={faGraduationCap} color="#8b5cf6" />
                  🎯 Mentors recommandés pour améliorer votre BMC
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mentorsRecommandes.map((mentor, idx) => (
                    <div key={idx} style={styles.mentorCard}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                          {mentor.firstName} {mentor.lastName}
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          <FontAwesomeIcon icon={faStar} style={{ color: '#f59e0b', marginRight: '4px' }} />
                          Compatibilité: {mentor.scoreCompatibilite}%
                        </div>
                        {mentor.domainesPertinents && mentor.domainesPertinents.length > 0 && (
                          <div style={{ fontSize: '11px', marginTop: '4px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                            Expert en: {mentor.domainesPertinents.map(d => 
                              d === 'propositionValeur' ? 'Proposition de valeur' : 
                              d === 'segmentsClients' ? 'Segments clients' :
                              d === 'fluxRevenus' ? 'Flux de revenus' : 
                              d === 'structureCouts' ? 'Structure de coûts' : d
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#f59e0b' }}>
                        {getNiveauStars(mentor.expertiseBMC?.niveauGlobal || 0)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: darkMode ? '#64748b' : '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                  💡 Ces mentors sont disponibles pour vous accompagner dans l'amélioration de votre Business Model Canvas
                </div>
              </div>
            )}

            <button style={styles.closeBtn} onClick={() => setShowAnalyseModal(false)}>
              Voir tous les détails dans l'historique
            </button>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS ANALYSE EXISTANTE AVEC MENTORS */}
      {showDetailsModal && selectedDetails && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faEye} color="#667eea" />
              Détails de l'analyse
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px', color: '#667eea' }} />
                  <strong>Date :</strong> {new Date(selectedDetails.dateAnalyse).toLocaleString()}
                </div>
                <div style={styles.scoreBadge(selectedDetails.scoreImpact)}>
                  Score: {selectedDetails.scoreImpact}/100
                </div>
              </div>
            </div>

            <div style={styles.feedbackSection}>
              <div style={styles.feedbackTitle}>
                <FontAwesomeIcon icon={faComment} color="#667eea" />
                Analyse détaillée
              </div>
              {formatFeedback(selectedDetails.feedback).map((item, idx) => (
                <div key={idx} style={styles.feedbackItem(item.type)}>
                  {item.type === 'success' && <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />}
                  {item.type === 'error' && <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />}
                  {item.type === 'warning' && <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />}
                  {item.type === 'info' && <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />}
                  {item.text}
                </div>
              ))}
            </div>

            {selectedDetails.recommandations && selectedDetails.recommandations.length > 0 && (
              <div>
                <div style={styles.feedbackTitle}>
                  <FontAwesomeIcon icon={faLightbulb} color="#f59e0b" />
                  Recommandations
                </div>
                {selectedDetails.recommandations.slice(0, 8).map((rec, i) => (
                  <div key={i} style={styles.recommandationCard}>
                    <FontAwesomeIcon icon={faArrowRight} color="#f59e0b" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDetails.feedbackAdmin && (
              <div style={{ marginTop: '20px', padding: '16px', background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5', borderRadius: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faUserCheck} color="#10b981" />
                  Feedback de l'administrateur
                </div>
                <p style={{ lineHeight: '1.5' }}>{selectedDetails.feedbackAdmin}</p>
              </div>
            )}

            <button style={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionAnalysesIA;