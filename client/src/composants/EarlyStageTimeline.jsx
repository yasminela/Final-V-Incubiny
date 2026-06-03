import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faBullseye, faUsers, faCalendarAlt, faChevronDown, faChevronUp, faLightbulb, faChartLine, faHandshake, faTrophy, faClock
} from '@fortawesome/free-solid-svg-icons';

const moisImages = {
  1: '/mois1.png',
  2: '/mois2.png',
  3: '/mois3.png',
  4: '/mois4.png',
  5: '/mois5.png',
  6: '/mois6.png'
};

const etapesProgramme = [
  { 
    mois: 1, 
    titre: "Idéation & Créativité", 
    description: "Transformez votre idée en concept structuré", 
    objectif: "Définir votre vision et valider votre concept",
    ateliers: ["Posture entrepreneuriale - Mme Lamia Ben Ammar", "Design Thinking - Mme Sameh Chemli"],
    duree: "4 semaines",
    icon: faLightbulb
  },
  { 
    mois: 2, 
    titre: "Business Model & Stratégie", 
    description: "Construisez votre modèle économique", 
    objectif: "Finaliser votre Business Model Canvas",
    ateliers: ["Green Business Model Canvas - Mme Dorsaf Hlel", "Veille marché & analyse de données"],
    duree: "4 semaines",
    icon: faChartLine
  },
  { 
    mois: 3, 
    titre: "Étude de faisabilité", 
    description: "Validez la viabilité de votre projet", 
    objectif: "Préparer votre dossier de faisabilité",
    ateliers: ["Propriété intellectuelle - Mme Neila Ben Slima", "Étude financière - Mme Lamia Ben Ammar"],
    duree: "4 semaines",
    icon: faBullseye
  },
  { 
    mois: 4, 
    titre: "Prototypage & Solution", 
    description: "Donnez vie à votre produit", 
    objectif: "Développer un prototype fonctionnel",
    ateliers: ["Maker Space - Prototypage", "Proof of Concept - Tech Lab", "Support DATADOIT"],
    duree: "4 semaines",
    icon: faUsers
  },
  { 
    mois: 5, 
    titre: "Branding & Positionnement", 
    description: "Construisez votre identité de marque", 
    objectif: "Développer votre stratégie marketing",
    ateliers: ["Marketing digital & e-réputation", "Immersion startups - Pépinière S2T"],
    duree: "4 semaines",
    icon: faHandshake
  },
  { 
    mois: 6, 
    titre: "Préparation à l'incubation", 
    description: "Finalisez votre dossier et pitch", 
    objectif: "Décrocher le label Startup ACT",
    ateliers: ["Atelier pré-label Startup ACT", "Networking avec investisseurs", "Pitch devant comité d'experts"],
    duree: "4 semaines",
    icon: faTrophy
  }
];

function EarlyStageTimeline() {
  const { darkMode } = useTheme();
  const [expandedMois, setExpandedMois] = useState(null);

  const toggleExpand = (mois) => {
    setExpandedMois(expandedMois === mois ? null : mois);
  };

  const getMoisColor = (mois) => {
    const colors = {
      1: '#6366f1',
      2: '#8b5cf6',
      3: '#06b6d4',
      4: '#10b981',
      5: '#f59e0b',
      6: '#ef4444'
    };
    return colors[mois] || '#9333ea';
  };

  const styles = {
    container: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '32px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px'
    },
    badge: {
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      padding: '6px 16px',
      borderRadius: '30px',
      fontSize: '13px',
      fontWeight: 'bold',
      display: 'inline-block',
      marginTop: '8px'
    },
    objectifFinal: {
      marginTop: '16px',
      background: darkMode ? '#334155' : '#fef3c7',
      padding: '10px 20px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#fbbf24' : '#92400e',
      display: 'inline-block'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginTop: '24px'
    },
    card: {
      background: darkMode ? '#0f172a' : '#ffffff',
      borderRadius: '20px',
      overflow: 'hidden',
      cursor: 'pointer',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      transition: 'transform 0.2s'
    },
    imgWrapper: {
      position: 'relative',
      height: '180px',
      overflow: 'hidden',
      background: darkMode ? '#1e293b' : '#f1f5f9'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    moisBadge: (mois) => ({
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: getMoisColor(mois),
      color: 'white',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold'
    }),
    content: {
      padding: '20px'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    iconWrapper: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: darkMode ? '#334155' : '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9333ea'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b',
      flex: 1
    },
    dureeBadge: {
      background: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#94a3b8' : '#64748b',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px'
    },
    description: {
      color: darkMode ? '#cbd5e1' : '#475569',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px',
      paddingLeft: '12px',
      borderLeft: '3px solid #9333ea'
    },
    expandBtn: {
      marginTop: '10px',
      color: '#9333ea',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      width: '100%',
      justifyContent: 'center',
      padding: '8px 0'
    },
    expandedContent: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    section: {
      marginBottom: '16px'
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    ateliersList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px'
    },
    atelierTag: {
      background: darkMode ? '#334155' : '#f1f5f9',
      padding: '6px 12px',
      borderRadius: '10px',
      fontSize: '12px',
      color: darkMode ? '#e2e8f0' : '#475569'
    },
    footer: {
      marginTop: '32px',
      padding: '24px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
      borderRadius: '20px',
      textAlign: 'center',
      color: 'white'
    },
    footerText: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '12px'
    },
    footerSubtext: {
      fontSize: '13px',
      opacity: 0.9,
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <FontAwesomeIcon icon={faRocket} />
          Programme Early Stage
        </div>
        <div>
          <span style={styles.badge}> 6 mois d'accompagnement intensif</span>
        </div>
        <div style={styles.objectifFinal}>
           Objectif final : Décrocher le label Startup ACT
        </div>
      </div>
      
      <div style={styles.grid}>
        {etapesProgramme.map((etape) => (
          <div 
            key={etape.mois} 
            style={styles.card}
            onClick={() => toggleExpand(etape.mois)}
          >
            <div style={styles.imgWrapper}>
              <span style={styles.moisBadge(etape.mois)}>Mois {etape.mois}</span>
              <img 
                src={moisImages[etape.mois]} 
                alt={`Mois ${etape.mois}`}
                style={styles.img}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>

            <div style={styles.content}>
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper}>
                  <FontAwesomeIcon icon={etape.icon} />
                </div>
                <div style={styles.cardTitle}>{etape.titre}</div>
                <span style={styles.dureeBadge}>{etape.duree}</span>
              </div>
              
              <div style={styles.description}>{etape.description}</div>

              {expandedMois === etape.mois && (
                <div style={styles.expandedContent}>
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>
                      <FontAwesomeIcon icon={faBullseye} />
                      Objectif
                    </div>
                    <div style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#475569' }}>
                      {etape.objectif}
                    </div>
                  </div>

                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>
                      <FontAwesomeIcon icon={faUsers} />
                      Ateliers
                    </div>
                    <div style={styles.ateliersList}>
                      {etape.ateliers.map((atelier, idx) => (
                        <span key={idx} style={styles.atelierTag}>
                          {atelier}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button style={styles.expandBtn}>
                <FontAwesomeIcon icon={expandedMois === etape.mois ? faChevronUp : faChevronDown} />
                {expandedMois === etape.mois ? "Voir moins" : "Voir plus"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <FontAwesomeIcon icon={faTrophy} size={28} />
        <p style={styles.footerText}>Pitch devant un comité d'experts</p>
        <p style={styles.footerSubtext}>Préparez-vous à convaincre les meilleurs investisseurs !</p>
      </div>
    </div>
  );
}

export default EarlyStageTimeline;