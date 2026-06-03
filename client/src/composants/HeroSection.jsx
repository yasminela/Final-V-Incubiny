import React from 'react';
import GlassCard from './ui/GlassCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faChartLine, faCalendarAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';

function HeroSection({ user, stats }) {
  return (
    <GlassCard>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #9333ea, #06b6d4)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '12px'
          }}>
            Bienvenue, {user?.firstName || 'Porteur'} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '16px' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(147, 51, 234, 0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FontAwesomeIcon icon={faRocket} size="sm" /> Programme Early Stage - 6 mois
            </span>
            {stats && (
              <>
                <span style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#22d3ee',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FontAwesomeIcon icon={faChartLine} size="sm" /> {stats.projetsCount || 0} projets
                </span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FontAwesomeIcon icon={faTrophy} size="sm" /> {stats.etapesCount || 0} étapes restantes
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #9333ea, #06b6d4)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <FontAwesomeIcon icon={faCalendarAlt} color="#fff" />
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </GlassCard>
  );
}

export default HeroSection;