import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, faLightbulb, faUser, faCheck, 
  faTimes, faSpinner, faStar, faChartLine, faRobot,
  faCalendar, faClock, faMapMarkerAlt, faEnvelope
} from '@fortawesome/free-solid-svg-icons';

function RecommandationsFormation({ porteurId, onClose }) {
  const { darkMode } = useTheme();
  const [analyses, setAnalyses] = useState([]);
  const [recommandations, setRecommandations] = useState([]);
  const [formations, setFormations] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [porteur, setPorteur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormations, setSelectedFormations] = useState([]);
  const [selectedEvenements, setSelectedEvenements] = useState([]);
  const [derniereAnalyse, setDerniereAnalyse] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [porteurId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les analyses IA du porteur
      const analysesRes = await api.get(`/ai/analyses-porteur/${porteurId}`);
      const analysesData = analysesRes.data || [];
      setAnalyses(analysesData);
      
      // Prendre la dernière analyse
      const dernier = analysesData.length > 0 ? analysesData[analysesData.length - 1] : null;
      setDerniereAnalyse(dernier);
      
      // Charger les infos du porteur
      try {
        const porteurRes = await api.get(`/utilisateurs/${porteurId}`);
        setPorteur(porteurRes.data);
      } catch (error) {
        console.error('Erreur chargement porteur:', error);
        if (dernier?.porteurId) {
          setPorteur(dernier.porteurId);
        } else {
          setPorteur({ firstName: 'Porteur', lastName: '', email: '' });
        }
      }
      
      // Générer des recommandations basées sur l'analyse
      if (dernier) {
        genererRecommandations(dernier);
      } else {
        setRecommandations([]);
        setFormations([]);
        setEvenements([]);
      }
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setRecommandations([]);
      setFormations([]);
      setEvenements([]);
      setPorteur({ firstName: 'Porteur', lastName: '', email: '' });
    } finally {
      setLoading(false);
    }
  };

  const genererRecommandations = (analyse) => {
    const recommandationsGenerees = [];
    const formationsGenerees = [];
    const evenementsGenerees = [];
    
    // Récupérer les recommandations de l'IA si disponibles
    if (analyse.recommandations && analyse.recommandations.length > 0) {
      recommandationsGenerees.push(...analyse.recommandations);
    }
    
    // Récupérer les formations recommandées par l'IA
    if (analyse.formations && analyse.formations.length > 0) {
      formationsGenerees.push(...analyse.formations);
    }
    
    // Récupérer les événements recommandés par l'IA
    if (analyse.evenements && analyse.evenements.length > 0) {
      evenementsGenerees.push(...analyse.evenements);
    }
    
    // Si pas de recommandations dans l'analyse, en générer selon le score
    if (recommandationsGenerees.length === 0) {
      const score = analyse.scoreImpact || 50;
      
      if (score < 40) {
        recommandationsGenerees.push(
          "🎯 **Revoyez votre proposition de valeur** : elle doit clairement expliquer le problème que vous résolvez.",
          "📊 **Définissez précisément vos segments clients** : qui sont vos clients cibles ?",
          "💰 **Structurez votre modèle économique** : identifiez vos sources de revenus."
        );
        formationsGenerees.push(
          "Formation: Business Model Canvas - Les fondamentaux",
          "Formation: Définir sa proposition de valeur",
          "Formation: Prévisions financières pour startups"
        );
      } else if (score < 70) {
        recommandationsGenerees.push(
          "⚡ **Renforcez votre avantage concurrentiel** : en quoi êtes-vous unique ?",
          "📈 **Affinez votre analyse de marché** : étudiez vos concurrents plus en détail.",
          "💡 **Testez votre proposition de valeur** auprès de potentiels clients."
        );
        formationsGenerees.push(
          "Formation: Optimisation du Business Model",
          "Formation: Stratégie de croissance",
          "Formation: Analyse concurrentielle avancée"
        );
      } else {
        recommandationsGenerees.push(
          "🚀 **Préparez votre phase de scaling** : comment passer à l'échelle ?",
          "💼 **Travaillez votre pitch** pour convaincre les investisseurs.",
          "🌍 **Explorez les opportunités d'expansion** géographique ou sectorielle."
        );
        formationsGenerees.push(
          "Formation: Scaling et expansion",
          "Formation: Levée de fonds et pitch deck",
          "Formation: Aspects juridiques et propriété intellectuelle"
        );
      }
    }
    
    setRecommandations([...new Set(recommandationsGenerees)]);
    setFormations([...new Set(formationsGenerees)]);
    setEvenements(evenementsGenerees);
  };

  const handleToggleFormation = (formation) => {
    setSelectedFormations(prev => 
      prev.includes(formation) ? prev.filter(f => f !== formation) : [...prev, formation]
    );
  };

  const handleToggleEvenement = (evenement) => {
    setSelectedEvenements(prev => 
      prev.includes(evenement) ? prev.filter(e => e !== evenement) : [...prev, evenement]
    );
  };

  const handleEnvoyerRecommandations = async () => {
    if (selectedFormations.length === 0 && selectedEvenements.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins une formation ou un événement à recommander');
      return;
    }
    
    setSending(true);
    try {
      await api.post('/notifications/envoyer-recommandations', {
        porteurId: porteurId,
        formations: selectedFormations,
        evenements: selectedEvenements
      });
      
      alert(`✅ ${selectedFormations.length + selectedEvenements.length} recommandation(s) envoyée(s) avec succès !`);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'envoi des recommandations: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  const getNiveauBadge = (score) => {
    if (score >= 70) return { text: 'Fort potentiel', color: '#10b981', bg: '#d1fae5' };
    if (score >= 40) return { text: 'Potentiel moyen', color: '#f59e0b', bg: '#fef3c7' };
    return { text: 'À améliorer', color: '#ef4444', bg: '#fee2e2' };
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
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '24px',
      padding: '28px',
      maxWidth: '750px',
      width: '90%',
      maxHeight: '85vh',
      overflowY: 'auto',
      position: 'relative'
    },
    header: {
      borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      paddingBottom: '16px',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    porteurInfo: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      padding: '16px',
      borderRadius: '16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },
    analyseInfo: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      padding: '16px',
      borderRadius: '16px',
      marginBottom: '20px'
    },
    scoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    },
    scoreCircle: (score) => ({
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: getNiveauBadge(score).bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: getNiveauBadge(score).color
    }),
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
      marginTop: '20px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderLeft: `4px solid #f59e0b`,
      paddingLeft: '12px'
    },
    recommandationCard: {
      background: darkMode ? '#0f172a' : '#fef3c7',
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '10px',
      borderLeft: `3px solid #f59e0b`
    },
    formationCard: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    },
    formationSelected: {
      border: `2px solid #10b981`,
      background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
    },
    btnEnvoyer: {
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '14px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      width: '100%',
      marginTop: '24px'
    },
    btnAnnuler: {
      background: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#ffffff' : '#1e293b',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      marginRight: '12px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    }
  };

  if (loading) {
    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.emptyState}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#9333ea" />
            <p style={{ marginTop: '16px' }}>Chargement de l'analyse du BMC...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>
            <FontAwesomeIcon icon={faGraduationCap} color="#9333ea" />
            Recommandations personnalisées
          </div>
        </div>

        <div style={styles.porteurInfo}>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #9333ea, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faUser} color="white" size="lg" />
          </div>
          <div>
            <strong style={{ fontSize: '16px' }}>
              {porteur?.firstName || 'Porteur'} {porteur?.lastName || ''}
            </strong>
            <br />
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              {porteur?.email || 'Email non disponible'}
            </span>
          </div>
        </div>

        {derniereAnalyse ? (
          <>
            <div style={styles.analyseInfo}>
              <div style={styles.scoreContainer}>
                <div style={styles.scoreCircle(derniereAnalyse.scoreImpact)}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{derniereAnalyse.scoreImpact}</span>
                  <span style={{ fontSize: '12px' }}>/100</span>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {getNiveauBadge(derniereAnalyse.scoreImpact).text}
                  </div>
                  <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    <FontAwesomeIcon icon={faRobot} style={{ marginRight: '4px' }} />
                    Analyse du {new Date(derniereAnalyse.dateAnalyse).toLocaleDateString('fr-FR')}
                  </div>
                  {derniereAnalyse.secteur && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', background: darkMode ? '#334155' : '#e2e8f0' }}>
                        {derniereAnalyse.secteur.icone} {derniereAnalyse.secteur.nom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {derniereAnalyse.feedback && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: darkMode ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}>
                  <strong><FontAwesomeIcon icon={faRobot} /> Feedback IA :</strong>
                  <p style={{ marginTop: '6px' }}>{derniereAnalyse.feedback}</p>
                </div>
              )}
            </div>

            {recommandations.length > 0 && (
              <>
                <div style={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faLightbulb} color="#f59e0b" />
                  Recommandations d'amélioration
                </div>
                {recommandations.map((rec, idx) => (
                  <div key={idx} style={styles.recommandationCard}>
                    {rec}
                  </div>
                ))}
              </>
            )}

            {formations.length > 0 && (
              <>
                <div style={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faGraduationCap} color="#10b981" />
                  Formations recommandées
                  <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '8px' }}>
                    (Cliquez pour sélectionner)
                  </span>
                </div>
                {formations.map((formation, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.formationCard,
                      ...(selectedFormations.includes(formation) ? styles.formationSelected : {})
                    }}
                    onClick={() => handleToggleFormation(formation)}
                  >
                    <span>📚 {formation}</span>
                    {selectedFormations.includes(formation) && (
                      <span style={{ color: '#10b981' }}>
                        <FontAwesomeIcon icon={faCheck} /> Sélectionné
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            <button 
              style={styles.btnEnvoyer} 
              onClick={handleEnvoyerRecommandations}
              disabled={sending}
            >
              {sending ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Envoi en cours...</>
              ) : (
                <><FontAwesomeIcon icon={faGraduationCap} /> Recommander {selectedFormations.length + selectedEvenements.length} élément(s)</>
              )}
            </button>
          </>
        ) : (
          <div style={styles.emptyState}>
            <FontAwesomeIcon icon={faLightbulb} size="3x" style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>Aucune recommandation disponible</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Le porteur doit d'abord soumettre son BMC pour analyse
            </p>
          </div>
        )}
        
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button style={styles.btnAnnuler} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommandationsFormation;