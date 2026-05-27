import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faStar, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';

function RecommandationsMentors() {
  const { darkMode } = useTheme();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const res = await api.get('/mentors/public');
      setMentors(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
    mentorCard: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Chargement des mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <FontAwesomeIcon icon={faGraduationCap} color="#667eea" />
        Nos mentors experts
      </div>

      {mentors.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Aucun mentor disponible pour le moment</p>
        </div>
      ) : (
        mentors.map((mentor, idx) => (
          <div key={idx} style={styles.mentorCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{mentor.firstName} {mentor.lastName}</h3>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Expert en Business Model Canvas</p>
              </div>
              <div style={{
                background: '#667eea',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {mentor.expertiseBMC?.niveauGlobal || 0}/5
              </div>
            </div>
            {mentor.bio && (
              <p style={{ marginTop: '12px', fontSize: '13px', lineHeight: '1.5' }}>{mentor.bio}</p>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              📅 Disponible {mentor.disponibilite?.heuresParSemaine || 5}h/semaine
            </div>
            <button style={{
              marginTop: '16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faEnvelope} /> Contacter ce mentor
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default RecommandationsMentors;