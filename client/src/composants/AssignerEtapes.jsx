import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, faUser, faProjectDiagram, faCheckCircle, 
  faTimes, faSpinner, faRocket, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

function AssignerEtapes({ onClose, onSuccess }) {
  const { darkMode } = useTheme();
  const [porteurs, setPorteurs] = useState([]);
  const [selectedPorteur, setSelectedPorteur] = useState('');
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadPorteurs();
    loadProjets();
  }, []);

  const loadPorteurs = async () => {
    try {
      const res = await api.get('/utilisateurs');
      setPorteurs(res.data.filter(u => u.role === 'porteur'));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadProjets = async () => {
    try {
      const res = await api.get('/projets/tous');
      setProjets(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const etapesEarlyStage = [
    { numero: 1, titre: "Idéation", description: "Présentez votre idée de projet", mois: 1 },
    { numero: 2, titre: "Business Model Canvas", description: "Complétez votre BMC", mois: 2 },
    { numero: 3, titre: "Étude de marché", description: "Analyse du marché", mois: 2 },
    { numero: 4, titre: "Hypothèses critiques", description: "Listez vos hypothèses critiques", mois: 2 },
    { numero: 5, titre: "Étude financière", description: "Prévisionnel financier", mois: 3 },
    { numero: 6, titre: "Propriété intellectuelle", description: "Protection de l'innovation", mois: 3 },
    { numero: 7, titre: "Branding", description: "Logo et charte graphique", mois: 5 },
    { numero: 8, titre: "Marketing digital", description: "Stratégie marketing", mois: 5 },
    { numero: 9, titre: "Pitch deck", description: "Présentation PowerPoint", mois: 5 },
    { numero: 10, titre: "Dossier incubation", description: "Candidature à l'incubation", mois: 6 },
    { numero: 11, titre: "Soutenance finale", description: "Présentation orale", mois: 6 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await api.post('/etapes/assigner-early-stage', {
        porteurId: selectedPorteur,
        projetId: selectedProjet
      });
      
      setMessageType('success');
      setMessage(` ${etapesEarlyStage.length} étapes assignées avec succès !`);
      
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || '❌ Erreur lors de l\'assignation');
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    },
    title: {
      fontSize: 'clamp(20px, 5vw, 24px)',
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
    select: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'inherit',
      backgroundColor: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    option: {
      padding: '10px',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    etapesList: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px'
    },
    etapesTitle: {
      fontWeight: 'bold',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: darkMode ? '#ffffff' : '#1e293b',
      fontSize: '16px'
    },
    etapeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      fontSize: '13px',
      color: darkMode ? '#cbd5e1' : '#475569'
    },
    etapeMois: {
      background: darkMode ? '#334155' : '#e2e8f0',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '500',
      color: darkMode ? '#94a3b8' : '#64748b',
      minWidth: '55px',
      textAlign: 'center'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
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
      gap: '8px',
      transition: 'transform 0.2s'
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
      gap: '8px',
      transition: 'transform 0.2s'
    },
    messageBox: {
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    success: {
      background: '#d1fae5',
      color: '#059669'
    },
    error: {
      background: '#fee2e2',
      color: '#dc2626'
    },
    badge: {
      background: '#667eea',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      marginLeft: '8px'
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.title}>
          <FontAwesomeIcon icon={faRocket} color="#667eea" size="24px" />
          Assigner le programme Early-Stage
          <span style={styles.badge}>{etapesEarlyStage.length} étapes</span>
        </div>
        <div style={styles.subtitle}>
          <FontAwesomeIcon icon={faTasks} style={{ marginRight: '6px' }} />
          Programme d'incubation de 6 mois
        </div>

        {message && (
          <div style={{ 
            ...styles.messageBox, 
            ...(messageType === 'success' ? styles.success : styles.error)
          }}>
            <FontAwesomeIcon icon={messageType === 'success' ? faCheckCircle : faTimes} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faUser} style={{ marginRight: '6px' }} />
              Sélectionner un porteur
            </label>
            <select
              value={selectedPorteur}
              onChange={(e) => setSelectedPorteur(e.target.value)}
              required
              style={styles.select}
            >
              <option value="" style={styles.option}>-- Choisir un porteur --</option>
              {porteurs.map(p => (
                <option key={p._id} value={p._id} style={styles.option}>
                  {p.firstName} {p.lastName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faProjectDiagram} style={{ marginRight: '6px' }} />
              Sélectionner un projet
            </label>
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              required
              style={styles.select}
            >
              <option value="" style={styles.option}>-- Choisir un projet --</option>
              {projets.map(p => (
                <option key={p._id} value={p._id} style={styles.option}>
                  {p.titre || p.nomProjet}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.etapesList}>
            <div style={styles.etapesTitle}>
              <FontAwesomeIcon icon={faCheckCircle} color="#10b981" />
              Programme à assigner :
            </div>
            {etapesEarlyStage.map((e, idx) => (
              <div key={idx} style={styles.etapeItem}>
                <span style={styles.etapeMois}>Mois {e.mois}</span>
                <span> {e.titre}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>({e.description})</span>
              </div>
            ))}
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={loading} 
              style={styles.submitBtn}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Assignation...</>
              ) : (
                <><FontAwesomeIcon icon={faTasks} /> Assigner les étapes</>
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelBtn}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignerEtapes;