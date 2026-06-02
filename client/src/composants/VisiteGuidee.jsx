import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faChartLine, faBuilding, faUpload, faRobot,
  faUsers, faFileAlt, faEye, faCheck, faTimes,
  faArrowRight, faArrowLeft, faTimes as faClose,
  faLightbulb, faTasks, faCalendar, faTachometerAlt,
  faUserGraduate, faClipboardList, faStar
} from '@fortawesome/free-solid-svg-icons';

// Étapes pour le Porteur de projet
const porteurSteps = [
  {
    id: 1,
    title: "Bienvenue sur Incubiny !",
    description: "Votre plateforme d'incubation de startups. Ici vous allez pouvoir gérer votre projet et suivre votre progression.",
    position: "center"
  },
  {
    id: 2,
    title: "Tableau de bord",
    description: "Visualisez vos statistiques : nombre de projets, tâches à faire et étapes restantes du programme.",
    target: "dashboard"
  },
  {
    id: 3,
    title: "Mes projets",
    description: "Créez, modifiez ou supprimez vos projets. Chaque projet sera analysé et validé par un administrateur.",
    target: "mesProjets"
  },
  {
    id: 4,
    title: "Mon programme",
    description: "Suivez votre programme Early Stage, consultez les étapes et soumettez vos documents pour validation.",
    target: "monProgramme"
  },
  {
    id: 5,
    title: "Mes soumissions",
    description: "Consultez l'état de vos documents soumis : en attente, validés ou à reprendre avec les feedbacks.",
    target: "mesSoumissions"
  },
  {
    id: 6,
    title: "Analyses IA",
    description: "Téléchargez votre Business Model Canvas (BMC), l'IA l'analyse et vous donne un score avec des recommandations personnalisées.",
    target: "analysesIA"
  },
  {
    id: 7,
    title: "Calendrier",
    description: "Retrouvez tous vos événements, ateliers et webinaires à venir dans le programme.",
    target: "calendrier"
  },
  {
    id: 8,
    title: "Objectif final",
    description: "Complétez toutes les étapes pour décrocher le label Startup ACT et pitcher devant des investisseurs !",
    position: "center"
  }
];

// Étapes pour l'Administrateur
const adminSteps = [
  {
    id: 1,
    title: "Bienvenue Administrateur !",
    description: "Gérez l'ensemble des porteurs, projets et soumissions depuis votre tableau de bord centralisé.",
    position: "center"
  },
  {
    id: 2,
    title: "Tableau de bord",
    description: "Visualisez les indicateurs clés : projets en attente, porteurs actifs et soumissions à traiter.",
    target: "dashboard"
  },
  {
    id: 3,
    title: "Gestion des porteurs",
    description: "Créez, modifiez ou supprimez des comptes porteurs. Suivez leur progression individuelle.",
    target: "porteurs"
  },
  {
    id: 4,
    title: "Projets à valider",
    description: "Consultez les projets soumis par les porteurs, analysez-les, validez ou demandez des modifications.",
    target: "projets"
  },
  {
    id: 5,
    title: "Documents à valider",
    description: "Visualisez les documents soumis (BMC, études, etc.), laissez un feedback, validez ou refusez.",
    target: "soumissions"
  },
  {
    id: 6,
    title: "Analyses IA - BMC",
    description: "Consultez les analyses automatiques des BMC, ajoutez votre feedback et recommandez des formations.",
    target: "analysesIA"
  },
  {
    id: 7,
    title: "Scores des porteurs",
    description: "Suivez les performances des porteurs (score de profil, ponctualité, progression).",
    target: "scores"
  },
  {
    id: 8,
    title: "Missions clés",
    description: "Assurez le suivi et l'accompagnement des porteurs vers l'obtention du label Startup ACT.",
    position: "center"
  }
];

function VisiteGuidee({ userRole, onComplete }) {
  const { darkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [targetPosition, setTargetPosition] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%' });

  const steps = userRole === 'admin' ? adminSteps : porteurSteps;

  // Vérifier si le guide a déjà été vu
  useEffect(() => {
    const tourCompleted = localStorage.getItem(`guide_${userRole}_completed`);
    if (tourCompleted) {
      setVisible(false);
      if (onComplete) onComplete();
    }
  }, [userRole, onComplete]);

  // Mettre à jour la position de l'élément cible
  useEffect(() => {
    if (currentStep >= 0 && steps[currentStep] && steps[currentStep].target) {
      const timer = setTimeout(() => {
        updateTargetPosition();
      }, 300);
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    }
  }, [currentStep]);

  const updateTargetPosition = () => {
    const targetId = steps[currentStep].target;
    let element = null;
    
    // Chercher l'élément par son texte ou classe
    if (targetId === 'dashboard') {
      element = document.querySelector('.stat-card, [class*="statCard"], [class*="stats"]');
      if (!element) {
        const btns = document.querySelectorAll('button');
        for (let btn of btns) {
          if (btn.textContent.includes('Tableau de bord')) {
            element = btn;
            break;
          }
        }
      }
    } else if (targetId === 'mesProjets') {
      const titles = document.querySelectorAll('[class*="sectionTitle"]');
      for (let title of titles) {
        if (title.textContent.includes('Mes projets')) {
          element = title;
          break;
        }
      }
    } else if (targetId === 'monProgramme') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Mon programme')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'mesSoumissions') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Mes soumissions')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'analysesIA') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Analyses IA')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'calendrier') {
      element = document.querySelector('[class*="Calendrier"], [class*="calendar"]');
      if (!element) {
        const titles = document.querySelectorAll('[class*="title"]');
        for (let title of titles) {
          if (title.textContent.includes('Calendrier')) {
            element = title;
            break;
          }
        }
      }
    } else if (targetId === 'porteurs') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Porteurs')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'projets') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Projets')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'soumissions') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Soumissions')) {
          element = btn;
          break;
        }
      }
    } else if (targetId === 'scores') {
      const btns = document.querySelectorAll('button');
      for (let btn of btns) {
        if (btn.textContent.includes('Scores')) {
          element = btn;
          break;
        }
      }
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const scrollLeft = window.scrollX;
      
      setTargetPosition({
        top: rect.top + scrollTop - 8,
        left: rect.left + scrollLeft - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        bottom: rect.bottom + scrollTop + 8
      });
      
      // Calculer la position du popup (à droite de l'élément si possible)
      let popupTop = rect.top + scrollTop;
      let popupLeft = rect.right + scrollLeft + 20;
      
      // Si le popup dépasse à droite, le mettre à gauche
      if (popupLeft + 350 > window.innerWidth + scrollLeft) {
        popupLeft = rect.left + scrollLeft - 370;
      }
      
      // Si le popup dépasse en bas, le remonter
      if (popupTop + 300 > window.innerHeight + scrollTop) {
        popupTop = rect.bottom + scrollTop - 280;
      }
      
      // Si le popup dépasse en haut
      if (popupTop < scrollTop) {
        popupTop = rect.bottom + scrollTop + 10;
      }
      
      setPopupPosition({
        top: popupTop,
        left: popupLeft
      });
    } else {
      setTargetPosition(null);
      setPopupPosition({ top: '50%', left: '50%' });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Faire défiler vers l'élément cible
      if (steps[currentStep + 1].target) {
        setTimeout(() => {
          const targetId = steps[currentStep + 1].target;
          let element = null;
          if (targetId === 'dashboard') {
            element = document.querySelector('.stat-card, [class*="statCard"]');
          } else if (targetId === 'monProgramme' || targetId === 'mesSoumissions' || targetId === 'analysesIA' || targetId === 'porteurs' || targetId === 'projets' || targetId === 'soumissions' || targetId === 'scores') {
            const btns = document.querySelectorAll('button');
            for (let btn of btns) {
              if (targetId === 'monProgramme' && btn.textContent.includes('Mon programme')) {
                element = btn;
                break;
              } else if (targetId === 'mesSoumissions' && btn.textContent.includes('Mes soumissions')) {
                element = btn;
                break;
              } else if (targetId === 'analysesIA' && btn.textContent.includes('Analyses IA')) {
                element = btn;
                break;
              } else if (targetId === 'porteurs' && btn.textContent.includes('Porteurs')) {
                element = btn;
                break;
              } else if (targetId === 'projets' && btn.textContent.includes('Projets')) {
                element = btn;
                break;
              } else if (targetId === 'soumissions' && btn.textContent.includes('Soumissions')) {
                element = btn;
                break;
              } else if (targetId === 'scores' && btn.textContent.includes('Scores')) {
                element = btn;
                break;
              }
            }
          } else if (targetId === 'mesProjets') {
            const titles = document.querySelectorAll('[class*="sectionTitle"]');
            for (let title of titles) {
              if (title.textContent.includes('Mes projets')) {
                element = title;
                break;
              }
            }
          } else if (targetId === 'calendrier') {
            element = document.querySelector('[class*="Calendrier"]');
          }
          
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else {
      completeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (steps[currentStep - 1].target) {
        setTimeout(() => {
          const targetId = steps[currentStep - 1].target;
          let element = null;
          if (targetId === 'dashboard') {
            element = document.querySelector('.stat-card, [class*="statCard"]');
          } else if (targetId === 'monProgramme' || targetId === 'mesSoumissions' || targetId === 'analysesIA' || targetId === 'porteurs' || targetId === 'projets' || targetId === 'soumissions' || targetId === 'scores') {
            const btns = document.querySelectorAll('button');
            for (let btn of btns) {
              if (targetId === 'monProgramme' && btn.textContent.includes('Mon programme')) {
                element = btn;
                break;
              } else if (targetId === 'mesSoumissions' && btn.textContent.includes('Mes soumissions')) {
                element = btn;
                break;
              } else if (targetId === 'analysesIA' && btn.textContent.includes('Analyses IA')) {
                element = btn;
                break;
              } else if (targetId === 'porteurs' && btn.textContent.includes('Porteurs')) {
                element = btn;
                break;
              } else if (targetId === 'projets' && btn.textContent.includes('Projets')) {
                element = btn;
                break;
              } else if (targetId === 'soumissions' && btn.textContent.includes('Soumissions')) {
                element = btn;
                break;
              } else if (targetId === 'scores' && btn.textContent.includes('Scores')) {
                element = btn;
                break;
              }
            }
          } else if (targetId === 'mesProjets') {
            const titles = document.querySelectorAll('[class*="sectionTitle"]');
            for (let title of titles) {
              if (title.textContent.includes('Mes projets')) {
                element = title;
                break;
              }
            }
          } else if (targetId === 'calendrier') {
            element = document.querySelector('[class*="Calendrier"]');
          }
          
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const completeGuide = () => {
    localStorage.setItem(`guide_${userRole}_completed`, 'true');
    setVisible(false);
    if (onComplete) onComplete();
  };

  if (!visible) return null;

  const current = steps[currentStep];
  const hasTarget = current.target && targetPosition;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: 9998,
      backdropFilter: 'blur(4px)'
    },
    highlight: hasTarget ? {
      position: 'absolute',
      top: targetPosition.top,
      left: targetPosition.left,
      width: targetPosition.width,
      height: targetPosition.height,
      borderRadius: '12px',
      boxShadow: '0 0 0 4px #667eea, 0 0 0 8px rgba(102,126,234,0.3)',
      zIndex: 10000,
      pointerEvents: 'none',
      transition: 'all 0.3s ease',
      animation: 'pulse 1s ease-in-out infinite'
    } : {},
    popup: {
      position: 'fixed',
      top: hasTarget ? popupPosition.top : '50%',
      left: hasTarget ? popupPosition.left : '50%',
      transform: hasTarget ? 'translateY(0)' : 'translate(-50%, -50%)',
      maxWidth: '320px',
      width: '90%',
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      zIndex: 10001,
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    stepNumber: {
      position: 'absolute',
      top: '-10px',
      left: '15px',
      background: '#667eea',
      color: 'white',
      borderRadius: '20px',
      padding: '2px 10px',
      fontSize: '10px',
      fontWeight: 'bold'
    },
    closeBtn: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '14px'
    },
    iconWrapper: {
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#1e293b',
      marginBottom: '8px'
    },
    description: {
      fontSize: '13px',
      color: darkMode ? '#cbd5e1' : '#475569',
      lineHeight: '1.5',
      marginBottom: '16px'
    },
    progress: {
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginBottom: '16px'
    },
    dot: (active) => ({
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: active ? '#667eea' : (darkMode ? '#475569' : '#cbd5e1'),
      transition: 'all 0.3s'
    }),
    buttonGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '10px'
    },
    btnPrev: {
      padding: '8px 14px',
      background: 'none',
      border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      color: darkMode ? '#94a3b8' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    btnNext: {
      padding: '8px 18px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    btnSkip: {
      padding: '6px 10px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '10px',
      color: darkMode ? '#64748b' : '#94a3b8',
      textDecoration: 'underline',
      marginTop: '8px',
      display: 'block',
      width: '100%',
      textAlign: 'center'
    },
    pointer: hasTarget ? {
      position: 'absolute',
      left: '-8px',
      top: '20px',
      width: '0',
      height: '0',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: `8px solid ${darkMode ? '#1e293b' : 'white'}`
    } : {}
  };

  return (
    <>
      <div style={styles.overlay} onClick={completeGuide} />
      {hasTarget && <div style={styles.highlight} />}
      
      <div style={styles.popup}>
        <button style={styles.closeBtn} onClick={completeGuide}>
          <FontAwesomeIcon icon={faClose} />
        </button>
        
        <div style={styles.stepNumber}>{currentStep + 1}/{steps.length}</div>
        
        <div style={styles.iconWrapper}>
          {current.id === 1 && <FontAwesomeIcon icon={faRocket} size="1.5x" color="white" />}
          {current.id === 2 && <FontAwesomeIcon icon={faChartLine} size="1.5x" color="white" />}
          {current.id === 3 && <FontAwesomeIcon icon={faBuilding} size="1.5x" color="white" />}
          {current.id === 4 && <FontAwesomeIcon icon={faTasks} size="1.5x" color="white" />}
          {current.id === 5 && <FontAwesomeIcon icon={faUpload} size="1.5x" color="white" />}
          {current.id === 6 && <FontAwesomeIcon icon={faRobot} size="1.5x" color="white" />}
          {current.id === 7 && <FontAwesomeIcon icon={faCalendar} size="1.5x" color="white" />}
          {current.id === 8 && <FontAwesomeIcon icon={faStar} size="1.5x" color="white" />}
        </div>
        
        <h3 style={styles.title}>{current.title}</h3>
        <p style={styles.description}>{current.description}</p>
        
        <div style={styles.progress}>
          {steps.map((_, idx) => (
            <div key={idx} style={styles.dot(idx === currentStep)} />
          ))}
        </div>
        
        <div style={styles.buttonGroup}>
          {currentStep > 0 ? (
            <button style={styles.btnPrev} onClick={prevStep}>
              <FontAwesomeIcon icon={faArrowLeft} size="sm" /> Précédent
            </button>
          ) : (
            <div />
          )}
          
          <button style={styles.btnNext} onClick={nextStep}>
            {currentStep < steps.length - 1 ? (
              <>Suivant <FontAwesomeIcon icon={faArrowRight} size="sm" /></>
            ) : (
              <>Terminer <FontAwesomeIcon icon={faCheck} size="sm" /></>
            )}
          </button>
        </div>
        
        <button style={styles.btnSkip} onClick={completeGuide}>
          Ignorer le guide
        </button>
        
        {hasTarget && <div style={styles.pointer} />}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `
      }} />
    </>
  );
}

export default VisiteGuidee;