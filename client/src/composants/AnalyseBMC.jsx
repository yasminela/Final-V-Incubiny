import React, { useState } from 'react';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, faSpinner, faExclamationTriangle, faCheckCircle, 
  faGraduationCap, faInfoCircle, faDownload, faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { iconColors } from '../styles/iconColors';

function AnalyseBMC({ projetId, onAnalyseComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [error, setError] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResultat(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier BMC (PDF)');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('bmc', file);
    formData.append('projetId', projetId || '');

    try {
      const response = await api.post('/ai/analyser-bmc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultat(response.data);
      
      console.log(' Analyse terminée, envoi à l\'admin...');
      
      await api.post('/notifications/send-report', {
        projetId: projetId,
        resultat: response.data,
        fichierBMC: file.name
      });
      
      console.log(' Rapport envoyé à l\'admin');
      
      if (onAnalyseComplete) onAnalyseComplete(response.data);
    } catch (err) {
      console.error(' Erreur analyse:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'analyse');
      setResultat(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport d'analyse d'impact</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .score { font-size: 48px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .score-faible { background: #fee2e2; color: #ef4444; }
          .score-moyen { background: #fef3c7; color: #f59e0b; }
          .score-fort { background: #d1fae5; color: #10b981; }
          .secteur { display: inline-block; padding: 8px 16px; border-radius: 20px; margin: 10px 0; }
          .feedback { background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0; }
          .formation { padding: 10px; background: #f8fafc; border-radius: 8px; margin: 8px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport d'analyse d'impact</h1>
          <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="score score-${resultat.niveauImpact === 'faible' ? 'faible' : resultat.niveauImpact === 'moyen' ? 'moyen' : 'fort'}">
          ${resultat.scoreImpact}/100 - ${resultat.niveauImpact === 'faible' ? 'Impact faible' : resultat.niveauImpact === 'moyen' ? 'Impact moyen' : 'Impact fort'}
        </div>
        <div class="secteur" style="background: ${resultat.secteur.couleur}20; color: ${resultat.secteur.couleur};">
          ${resultat.secteur.icone} ${resultat.secteur.nom}
        </div>
        <div class="feedback">
          <strong>Feedback IA :</strong><br>${resultat.feedback}
        </div>
        <h3>Formations recommandées :</h3>
        ${resultat.formations.map(f => `<div class="formation">✅ ${f}</div>`).join('')}
        <div class="footer">
          Document généré par Incubiny - Plateforme d'incubation de startups
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const sendReportToAdmin = async () => {
    if (!resultat) return;
    setSendingReport(true);
    try {
      await api.post('/notifications/send-report', {
        projetId: projetId,
        resultat: resultat,
        fichierBMC: file?.name
      });
      alert(' Rapport envoyé à l\'administrateur avec succès !');
    } catch (err) {
      console.error('Erreur envoi rapport:', err);
      alert(' Erreur lors de l\'envoi du rapport');
    } finally {
      setSendingReport(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 35) return '#ef4444';
    if (score < 65) return '#f59e0b';
    return '#10b981';
  };

  const getScoreText = (score) => {
    if (score < 35) return 'Impact faible';
    if (score < 65) return 'Impact moyen';
    return 'Impact fort';
  };

  const styles = {
    container: { background: iconColors.white, borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    title: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: iconColors.black, display: 'flex', alignItems: 'center', gap: '10px', borderLeft: `4px solid ${iconColors.primary}`, paddingLeft: '16px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: iconColors.black },
    fileInput: { width: '100%', padding: '12px', border: `1px solid #e2e8f0`, borderRadius: '12px', fontSize: '14px' },
    submitBtn: { background: iconColors.primary, color: iconColors.white, border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
    buttonGroup: { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' },
    secondaryBtn: { background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
    adminBtn: { background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
    scoreContainer: { textAlign: 'center', padding: '20px', background: iconColors.grayBg, borderRadius: '16px', marginBottom: '20px' },
    scoreValue: (score) => ({ fontSize: '48px', fontWeight: 'bold', color: getScoreColor(score), marginBottom: '8px' }),
    scoreLabel: (score) => ({ fontSize: '16px', color: getScoreColor(score), fontWeight: '500' }),
    secteurBadge: (secteur) => ({ display: 'inline-flex', alignItems: 'center', gap: '8px', background: secteur.couleur + '20', color: secteur.couleur, padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }),
    feedbackBox: { background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    formationsList: { marginTop: '16px' },
    formationItem: { padding: '12px', background: iconColors.grayBg, borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
    errorMsg: { background: '#fee2e2', color: iconColors.danger, padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faBrain} color={iconColors.primary} />
        Analyse d'impact par IA
      </div>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}> Déposez votre Business Model Canvas (PDF)</label>
          <input type="file" accept=".pdf" onChange={handleFileChange} disabled={loading} style={styles.fileInput} />
        </div>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Analyse en cours...</> : <><FontAwesomeIcon icon={faBrain} /> Analyser mon impact</>}
        </button>
      </form>
      {error && <div style={styles.errorMsg}><FontAwesomeIcon icon={faExclamationTriangle} color={iconColors.danger} /> {error}</div>}
      {resultat && !loading && (
        <div>
          <div style={styles.scoreContainer}>
            <div style={styles.scoreValue(resultat.scoreImpact)}>{resultat.scoreImpact}/100</div>
            <div style={styles.scoreLabel(resultat.scoreImpact)}>{getScoreText(resultat.scoreImpact)}</div>
          </div>
          <div style={styles.secteurBadge(resultat.secteur)}>{resultat.secteur.icone} {resultat.secteur.nom}</div>
          <div style={styles.feedbackBox}><FontAwesomeIcon icon={faInfoCircle} color="#166534" /> {resultat.feedback}</div>
          <div style={styles.formationsList}>
            <h4 style={{ marginBottom: '12px' }}><FontAwesomeIcon icon={faGraduationCap} color={iconColors.primary} /> Formations recommandées :</h4>
            {resultat.formations.map((formation, idx) => (
              <div key={idx} style={styles.formationItem}><FontAwesomeIcon icon={faCheckCircle} color={iconColors.success} /> {formation}</div>
            ))}
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={generatePDF} style={styles.secondaryBtn}><FontAwesomeIcon icon={faDownload} /> Télécharger mon rapport (PDF)</button>
            <button onClick={sendReportToAdmin} disabled={sendingReport} style={styles.adminBtn}>
              <FontAwesomeIcon icon={faEnvelope} spin={sendingReport} /> {sendingReport ? 'Envoi...' : 'Envoyer à l\'admin'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyseBMC;