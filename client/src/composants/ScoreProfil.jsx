import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import GlassCard from './ui/GlassCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faFile, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

function ScoreProfil() {
  const { darkMode } = useTheme();
  const [score, setScore] = useState(0);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      const res = await api.get('/profil/details-score');
      setScore(res.data.scoreTotal);
      setDetails(res.data);
    } catch (error) {
      console.error('Erreur chargement score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#06b6d4';
    if (score >= 20) return '#9333ea';
    return '#f59e0b';
  };

  const getMessage = () => {
    if (score >= 80) return 'Excellent ! Votre profil est complet.';
    if (score >= 50) return 'Bien ! Continuez à soumettre vos documents.';
    if (score >= 20) return 'Commencez à soumettre vos documents pour progresser.';
    return 'Soumettez votre premier document pour débuter.';
  };

  if (loading) return null;

  return (
    <GlassCard>
      <div>
        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: `linear-gradient(135deg, ${getScoreColor()}20, ${getScoreColor()}10)`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FontAwesomeIcon icon={faChartLine} color={getScoreColor()} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Score de progression</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{getMessage()}</p>
          </div>
        </div>

        {/* Barre de progression horizontale */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Progression globale</span>
            <span style={{ fontWeight: 'bold', color: getScoreColor() }}>{score}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: darkMode ? '#334155' : '#e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getScoreColor()}, ${getScoreColor() === '#9333ea' ? '#06b6d4' : getScoreColor()})`,
              borderRadius: '10px',
              transition: 'width 0.8s ease-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Détails */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: getScoreColor(),
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '12px',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {showDetails ? 'Masquer les détails' : 'Voir les détails'}
        </button>

        {showDetails && details && (
          <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)', borderRadius: '16px' }}>
            {/* Documents soumis */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span><FontAwesomeIcon icon={faFile} style={{ marginRight: '8px' }} /> Documents soumis</span>
                <span>{details.documents?.obtenu || 0}/{details.documents?.total || 25}</span>
              </div>
              <div style={{ height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${((details.documents?.obtenu || 0) / (details.documents?.total || 25)) * 100}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {details.documents?.compteur || 0} / {details.documents?.max || 5} documents soumis (5% chacun)
              </div>
            </div>

            {/* Étapes validées */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} /> Étapes validées</span>
                <span>{details.etapes?.obtenu || 0}/{details.etapes?.total || 20}</span>
              </div>
              <div style={{ height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${((details.etapes?.obtenu || 0) / (details.etapes?.total || 20)) * 100}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {details.etapes?.compteur || 0} / {details.etapes?.max || 4} étapes validées (5% chacune)
              </div>
            </div>

            {/* Informations personnelles */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span>Informations personnelles</span>
                <span>{details.personnel?.obtenu || 0}/{details.personnel?.total || 20}</span>
              </div>
              <div style={{ height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${((details.personnel?.obtenu || 0) / (details.personnel?.total || 20)) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </GlassCard>
  );
}

export default ScoreProfil;