import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import RecommandationsFormation from './RecommandationsFormation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faDownload, faComment, faTrash,
  faSpinner, faEnvelope, faEye, faBrain,
  faCheckCircle, faInfoCircle, faGraduationCap,
  faLightbulb, faRobot, faUserCheck, faStar,
  faFilter, faSearch, faCalendar, faRefresh,
  faChevronLeft, faChevronRight, faFilePdf
} from '@fortawesome/free-solid-svg-icons';

function AdminAnalysesIA() {
  const { darkMode } = useTheme();
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showRecommandations, setShowRecommandations] = useState(false);
  const [selectedPorteurForFormation, setSelectedPorteurForFormation] = useState(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('tous');
  const [filterFeedback, setFilterFeedback] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    filterAnalyses();
  }, [analyses, searchTerm, filterScore, filterFeedback]);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/toutes-les-analyses');
      setAnalyses(res.data || []);
    } catch (error) {
      console.error('Erreur chargement analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnalyses = () => {
    let filtered = [...analyses];
    
    // Recherche par nom ou email
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.porteurId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.porteurId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.porteurId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par score
    if (filterScore !== 'tous') {
      filtered = filtered.filter(a => {
        if (filterScore === 'fort') return a.scoreImpact >= 70;
        if (filterScore === 'moyen') return a.scoreImpact >= 40 && a.scoreImpact < 70;
        if (filterScore === 'faible') return a.scoreImpact < 40;
        return true;
      });
    }
    
    // Filtre par feedback admin
    if (filterFeedback !== 'tous') {
      filtered = filtered.filter(a => 
        filterFeedback === 'envoye' ? a.feedbackAdmin : !a.feedbackAdmin
      );
    }
    
    setFilteredAnalyses(filtered);
    setCurrentPage(1);
  };

  const generatePDF = (analyse) => {
    const recommandationsHtml = analyse.recommandations?.map(rec => 
      `<li style="margin-bottom: 10px;">${rec}</li>`
    ).join('') || '<li>Aucune recommandation spécifique</li>';

    const formationsHtml = analyse.formations?.map(formation => 
      `<li style="margin-bottom: 8px;">📚 ${formation}</li>`
    ).join('') || '<li>Aucune formation recommandée</li>';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport d'analyse - ${analyse.porteurId?.firstName} ${analyse.porteurId?.lastName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .score { font-size: 48px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .score-faible { background: #fee2e2; color: #ef4444; }
          .score-moyen { background: #fef3c7; color: #f59e0b; }
          .score-fort { background: #d1fae5; color: #10b981; }
          .info { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 10px; }
          .recommandations { background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; }
          .formations { background: #ede9fe; padding: 15px; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
          ul { margin: 0; padding-left: 20px; }
          h3 { margin: 0 0 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Rapport d'analyse d'impact</h1>
          <p>Porteur: ${analyse.porteurId?.firstName} ${analyse.porteurId?.lastName}</p>
          <p>Email: ${analyse.porteurId?.email}</p>
          <p>Date: ${new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="score score-${analyse.scoreImpact >= 70 ? 'fort' : analyse.scoreImpact >= 40 ? 'moyen' : 'faible'}">
          ${analyse.scoreImpact}/100
        </div>
        <div class="info">
          <strong>📎 Fichier BMC :</strong> ${analyse.fichierBMC || 'Non spécifié'}<br>
          <strong>🎯 Secteur :</strong> ${analyse.secteur?.icone || ''} ${analyse.secteur?.nom || 'Non détecté'}
        </div>
        <div class="info">
          <strong>🤖 Analyse IA :</strong><br>${analyse.feedback || 'Aucun feedback IA'}
        </div>
        <div class="recommandations">
          <strong>💡 Recommandations d'amélioration :</strong>
          <ul>${recommandationsHtml}</ul>
        </div>
        <div class="formations">
          <strong>📚 Formations recommandées :</strong>
          <ul>${formationsHtml}</ul>
        </div>
        ${analyse.feedbackAdmin ? `<div class="info"><strong>💬 Feedback administrateur :</strong><br>${analyse.feedbackAdmin}</div>` : ''}
        <div class="footer">Document généré par Incubiny - ${new Date().toLocaleDateString('fr-FR')}</div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const supprimerAnalyse = async (analyseId) => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette analyse ? Cette action est irréversible.')) return;
    
    try {
      await api.delete(`/ai/analyse/${analyseId}`);
      alert(' Analyse supprimée avec succès');
      loadAnalyses();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };
  
  const voirDetails = (analyse) => {
    setSelectedDetails(analyse);
    setShowDetailsModal(true);
  };

  const sendFeedback = async (analyseId) => {
    if (!feedback.trim()) {
      alert(' Veuillez saisir un feedback pour le porteur');
      return;
    }
    
    setSendingFeedback(true);
    try {
      await api.post(`/ai/analyse/${analyseId}/feedback`, { feedback });
      alert(' Feedback envoyé au porteur avec succès');
      setSelectedAnalyse(null);
      setFeedback('');
      loadAnalyses();
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
      alert(' Erreur lors de l\'envoi du feedback');
    } finally {
      setSendingFeedback(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreText = (score) => {
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Bon';
    if (score >= 30) return 'Moyen';
    return 'À améliorer';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return '🏆';
    if (score >= 40) return '📈';
    return '⚠️';
  };

  const handleRecommandation = (porteur) => {
    setSelectedPorteurForFormation(porteur);
    setShowRecommandations(true);
  };

  const getStatistiques = () => {
    const total = analyses.length;
    const withFeedback = analyses.filter(a => a.feedbackAdmin).length;
    const withoutFeedback = total - withFeedback;
    const avgScore = total > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.scoreImpact, 0) / total) : 0;
    const fort = analyses.filter(a => a.scoreImpact >= 70).length;
    const moyen = analyses.filter(a => a.scoreImpact >= 40 && a.scoreImpact < 70).length;
    const faible = analyses.filter(a => a.scoreImpact < 40).length;
    
    return { total, withFeedback, withoutFeedback, avgScore, fort, moyen, faible };
  };

  const stats = getStatistiques();
  
  // Pagination
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '16px',
      textAlign: 'center',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    statLabel: {
      fontSize: '12px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '4px'
    },
    filtersBar: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px',
      padding: '16px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      alignItems: 'center'
    },
    searchInput: {
      flex: 1,
      minWidth: '200px',
      padding: '10px 14px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      outline: 'none'
    },
    filterSelect: {
      padding: '10px 14px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer'
    },
    refreshBtn: {
      padding: '10px 16px',
      borderRadius: '10px',
      border: 'none',
      background: '#667eea',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      overflowX: 'auto'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      background: darkMode ? '#334155' : '#f1f5f9',
      color: darkMode ? '#cbd5e1' : '#475569',
      fontWeight: '600',
      fontSize: '13px',
      borderBottom: `2px solid ${darkMode ? '#475569' : '#e2e8f0'}`
    },
    td: {
      padding: '12px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      fontSize: '14px',
      color: darkMode ? '#e2e8f0' : '#475569'
    },
    badge: (score) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: getScoreColor(score) + '20',
      color: getScoreColor(score)
    }),
    actionBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      marginRight: '8px',
      borderRadius: '6px',
      transition: 'all 0.2s'
    },
    deleteBtn: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    },
    btnRecommandation: {
      background: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      marginTop: '8px',
      width: '100%',
      justifyContent: 'center'
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
      maxWidth: '700px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      paddingBottom: '12px'
    },
    textarea: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '16px',
      minHeight: '120px',
      maxHeight: '250px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      lineHeight: '1.5'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    feedbackReceived: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: 'bold',
      background: '#d1fae5',
      color: '#059669'
    },
    feedbackMissing: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: 'bold',
      background: '#fef3c7',
      color: '#d97706'
    },
    recommandationItem: {
      background: darkMode ? '#0f172a' : '#fef3c7',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '10px',
      borderLeft: `3px solid #f59e0b`
    },
    closeBtn: {
      marginTop: '20px',
      padding: '12px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '100%',
      fontWeight: 'bold'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    pageBtn: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer',
      minWidth: '40px'
    },
    activePageBtn: {
      background: '#667eea',
      color: 'white',
      border: 'none'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p style={{ marginTop: '16px' }}>Chargement des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faBrain} color="#667eea" />
        Analyses IA des BMC
        <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '8px', color: darkMode ? '#94a3b8' : '#64748b' }}>
          ({analyses.length} analyse{analyses.length > 1 ? 's' : ''})
        </span>
      </div>

      {/* Statistiques */}
      {analyses.length > 0 && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total analyses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.avgScore}</div>
            <div style={styles.statLabel}>Score moyen</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.withFeedback}</div>
            <div style={styles.statLabel}>Feedbacks envoyés</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.withoutFeedback}</div>
            <div style={styles.statLabel}>En attente</div>
          </div>
        </div>
      )}

      {/* Barre de filtres */}
      <div style={styles.filtersBar}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un porteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.searchInput, paddingLeft: '36px' }}
          />
        </div>
        
        <select value={filterScore} onChange={(e) => setFilterScore(e.target.value)} style={styles.filterSelect}>
          <option value="tous">Tous les scores</option>
          <option value="fort">Score fort (≥70)</option>
          <option value="moyen">Score moyen (40-69)</option>
          <option value="faible">Score faible (&lt;40)</option>
        </select>
        
        <select value={filterFeedback} onChange={(e) => setFilterFeedback(e.target.value)} style={styles.filterSelect}>
          <option value="tous">Tous les feedbacks</option>
          <option value="envoye">Feedback envoyé</option>
          <option value="non_envoye">Feedback non envoyé</option>
        </select>
        
        <button onClick={loadAnalyses} style={styles.refreshBtn}>
          <FontAwesomeIcon icon={faRefresh} /> Rafraîchir
        </button>
      </div>

      {filteredAnalyses.length === 0 ? (
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faChartLine} size={48} color="#cbd5e1" />
          <p>Aucune analyse IA reçue pour le moment</p>
          {analyses.length > 0 && <p style={{ fontSize: '13px', marginTop: '8px' }}>Essayez de modifier vos filtres de recherche</p>}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Porteur</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Secteur</th>
                  <th style={styles.th}>Feedback</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnalyses.map((analyse) => (
                  <tr key={analyse._id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <strong>
                          {getScoreIcon(analyse.scoreImpact)} {analyse.porteurId?.firstName} {analyse.porteurId?.lastName}
                        </strong>
                        <small>{analyse.porteurId?.email}</small>
                        <button 
                          onClick={() => handleRecommandation(analyse.porteurId)} 
                          style={styles.btnRecommandation}
                          className="btn-shine"
                        >
                          <FontAwesomeIcon icon={faGraduationCap} size="sm" />
                          Recommander une formation
                        </button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '6px', fontSize: '11px' }} />
                      {new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge(analyse.scoreImpact)}>
                        <FontAwesomeIcon icon={faStar} size="sm" style={{ marginRight: '3px' }} />
                        {analyse.scoreImpact}/100
                      </span>
                      <div style={{ fontSize: '11px', marginTop: '4px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                        {getScoreText(analyse.scoreImpact)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {analyse.secteur?.icone} {analyse.secteur?.nom || 'Non détecté'}
                    </td>
                    <td style={styles.td}>
                      {analyse.feedbackAdmin ? (
                        <span style={styles.feedbackReceived}>
                          <FontAwesomeIcon icon={faCheckCircle} size="sm" /> Envoyé
                        </span>
                      ) : (
                        <span style={styles.feedbackMissing}>
                          <FontAwesomeIcon icon={faInfoCircle} size="sm" /> En attente
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button onClick={() => voirDetails(analyse)} style={styles.actionBtn} title="Voir détails">
                          <FontAwesomeIcon icon={faEye} color="#3b82f6" size="lg" />
                        </button>
                        <button onClick={() => generatePDF(analyse)} style={styles.actionBtn} title="Télécharger PDF">
                          <FontAwesomeIcon icon={faFilePdf} color="#ef4444" size="lg" />
                        </button>
                        <button onClick={() => setSelectedAnalyse(analyse)} style={styles.actionBtn} title="Ajouter un feedback">
                          <FontAwesomeIcon icon={faComment} color="#f59e0b" size="lg" />
                        </button>
                        <button onClick={() => supprimerAnalyse(analyse._id)} style={styles.deleteBtn} title="Supprimer">
                          <FontAwesomeIcon icon={faTrash} size="sm" /> Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{ ...styles.pageBtn, ...(currentPage === pageNum ? styles.activePageBtn : {}) }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Détails avec recommandations IA */}
      {showDetailsModal && selectedDetails && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faBrain} color="#667eea" />
              Détails de l'analyse - {selectedDetails.porteurId?.firstName} {selectedDetails.porteurId?.lastName}
            </div>
            
            <div><strong> Email:</strong> {selectedDetails.porteurId?.email}</div>
            <div><strong> Date:</strong> {new Date(selectedDetails.dateAnalyse).toLocaleString()}</div>
            <div><strong> Fichier:</strong> {selectedDetails.fichierBMC}</div>
            
            <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
              <strong> Score:</strong> {selectedDetails.scoreImpact}/100 - {getScoreText(selectedDetails.scoreImpact)}
              <div style={{ 
                height: '8px', 
                background: darkMode ? '#334155' : '#e2e8f0', 
                borderRadius: '10px',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${selectedDetails.scoreImpact}%`,
                  height: '100%',
                  background: getScoreColor(selectedDetails.scoreImpact)
                }} />
              </div>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <strong><FontAwesomeIcon icon={faRobot} /> Analyse IA:</strong>
              <p style={{ marginTop: '8px', lineHeight: '1.5' }}>{selectedDetails.feedback}</p>
            </div>

            {/* Recommandations IA */}
            {selectedDetails.recommandations && selectedDetails.recommandations.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong><FontAwesomeIcon icon={faLightbulb} color="#f59e0b" /> Recommandations d'amélioration:</strong>
                {selectedDetails.recommandations.map((rec, idx) => (
                  <div key={idx} style={styles.recommandationItem}>
                    💡 {rec}
                  </div>
                ))}
              </div>
            )}

            {/* Formations recommandées */}
            {selectedDetails.formations && selectedDetails.formations.length > 0 && (
              <div style={{ marginTop: '15px', padding: '12px', background: darkMode ? '#0f172a' : '#ede9fe', borderRadius: '10px' }}>
                <strong><FontAwesomeIcon icon={faGraduationCap} color="#8b5cf6" /> Formations recommandées:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {selectedDetails.formations.map((formation, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>📚 {formation}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDetails.feedbackAdmin && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#d1fae5', borderRadius: '10px' }}>
                <strong><FontAwesomeIcon icon={faUserCheck} color="#10b981" /> Feedback Admin:</strong>
                <p style={{ marginTop: '8px' }}>{selectedDetails.feedbackAdmin}</p>
              </div>
            )}
            
            <button style={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Feedback */}
      {selectedAnalyse && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAnalyse(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              <FontAwesomeIcon icon={faComment} color="#667eea" />
              Feedback pour {selectedAnalyse.porteurId?.firstName} {selectedAnalyse.porteurId?.lastName}
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
              <p><strong> Score:</strong> {selectedAnalyse.scoreImpact}/100</p>
              <p><strong><FontAwesomeIcon icon={faRobot} /> Analyse IA:</strong></p>
              <p style={{ marginTop: '5px', fontSize: '13px' }}>{selectedAnalyse.feedback}</p>
            </div>
            
            <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
               Votre feedback pour le porteur :
            </label>
            <textarea
              placeholder="Rédigez votre feedback détaillé ici..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={styles.textarea}
              rows="5"
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => sendFeedback(selectedAnalyse._id)} 
                disabled={sendingFeedback}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
              >
                {sendingFeedback ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> Envoi...</>
                ) : (
                  <><FontAwesomeIcon icon={faEnvelope} /> Envoyer le feedback</>
                )}
              </button>
              <button 
                onClick={() => setSelectedAnalyse(null)} 
                style={{
                  background: darkMode ? '#334155' : '#e2e8f0',
                  color: darkMode ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  flex: 1,
                  fontWeight: 'bold'
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recommandations de formation */}
      {showRecommandations && selectedPorteurForFormation && (
        <RecommandationsFormation
          porteurId={selectedPorteurForFormation._id}
          onClose={() => {
            setShowRecommandations(false);
            setSelectedPorteurForFormation(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminAnalysesIA;