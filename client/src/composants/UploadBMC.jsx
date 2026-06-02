import React, { useState } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFilePdf, faSpinner, faRobot, faChartLine, faLightbulb } from '@fortawesome/free-solid-svg-icons';

function UploadBMC() {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyseResult, setAnalyseResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleAnalyse = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('bmc', selectedFile);

    try {
      const res = await api.post('/ai/analyser-bmc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAnalyseResult(res.data);
        setShowModal(true);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'analyse: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
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
    uploadZone: {
      border: `2px dashed ${darkMode ? '#475569' : '#cbd5e1'}`,
      borderRadius: '16px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
    },
    fileInput: { display: 'none' },
    uploadIcon: { fontSize: '48px', color: '#667eea', marginBottom: '16px' },
    uploadText: { fontSize: '16px', color: darkMode ? '#e2e8f0' : '#334155', marginBottom: '8px' },
    uploadHint: { fontSize: '12px', color: darkMode ? '#64748b' : '#94a3b8' },
    selectedFileInfo: {
      marginTop: '16px',
      padding: '12px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    analyseBtn: {
      width: '100%',
      marginTop: '20px',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    scoreContainer: {
      textAlign: 'center',
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '20px'
    },
    scoreValue: { fontSize: '48px', fontWeight: 'bold' },
    recommandationItem: {
      padding: '12px',
      marginBottom: '8px',
      background: darkMode ? '#0f172a' : '#fef3c7',
      borderRadius: '10px',
      borderLeft: '3px solid #f59e0b',
      fontSize: '13px'
    },
    closeBtn: {
      width: '100%',
      padding: '12px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faRobot} color="#667eea" />
        Analyse IA de mon Business Model Canvas
      </div>

      <div style={styles.uploadZone} onClick={() => document.getElementById('bmc-file').click()}>
        <input type="file" id="bmc-file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
        <FontAwesomeIcon icon={faUpload} style={styles.uploadIcon} />
        <div style={styles.uploadText}>Cliquez ou glissez votre fichier PDF ici</div>
        <div style={styles.uploadHint}>Format accepté : PDF (max 10 Mo)</div>
      </div>

      {selectedFile && (
        <div style={styles.selectedFileInfo}>
          <span><FontAwesomeIcon icon={faFilePdf} style={{ marginRight: '8px', color: '#ef4444' }} />{selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <button style={styles.analyseBtn} onClick={handleAnalyse} disabled={!selectedFile || uploading}>
        {uploading ? <><FontAwesomeIcon icon={faSpinner} spin /> Analyse en cours...</> : <><FontAwesomeIcon icon={faRobot} /> Analyser mon BMC</>}
      </button>
      
      {showModal && analyseResult && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}> Résultat de l'analyse</h3>
            <div style={{ ...styles.scoreContainer, background: getScoreColor(analyseResult.scoreImpact) + '20' }}>
              <div style={{ ...styles.scoreValue, color: getScoreColor(analyseResult.scoreImpact) }}>{analyseResult.scoreImpact}/100</div>
            </div>
            <div style={{ marginBottom: '16px' }}><strong>Feedback :</strong><p>{analyseResult.feedback}</p></div>
            {analyseResult.recommandations?.length > 0 && (
              <div><strong>Recommandations :</strong>
                {analyseResult.recommandations.slice(0, 3).map((rec, i) => <div key={i} style={styles.recommandationItem}>{rec}</div>)}
              </div>
            )}
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadBMC;