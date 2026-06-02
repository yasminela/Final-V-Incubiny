import React from 'react';
import { useTheme } from '../../context/ThemeContext';

function SkeletonLoader({ type = 'card', count = 1 }) {
  const { darkMode } = useTheme();

  // Fonction pour générer le style shimmer
  const getShimmerStyle = () => ({
    background: darkMode 
      ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
      : 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px'
  });

  if (type === 'hero') {
    return (
      <div style={{ background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', ...getShimmerStyle() }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '200px', height: '24px', marginBottom: '12px', ...getShimmerStyle() }} />
            <div style={{ width: '150px', height: '16px', ...getShimmerStyle() }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ width: '100%', height: '120px', borderRadius: '20px', ...getShimmerStyle() }} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
        <div style={{ width: '150px', height: '24px', marginBottom: '20px', ...getShimmerStyle() }} />
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
            <div style={{ flex: 1, height: '20px', ...getShimmerStyle() }} />
            <div style={{ flex: 1, height: '20px', ...getShimmerStyle() }} />
            <div style={{ flex: 1, height: '20px', ...getShimmerStyle() }} />
            <div style={{ flex: 0.5, height: '20px', ...getShimmerStyle() }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div style={{ background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
        <div style={{ width: '180px', height: '24px', marginBottom: '20px', ...getShimmerStyle() }} />
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', ...getShimmerStyle() }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '80%', height: '12px', marginBottom: '8px', ...getShimmerStyle() }} />
              <div style={{ width: '60%', height: '12px', ...getShimmerStyle() }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card par défaut
  return (
    <div style={{ background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', ...getShimmerStyle() }} />
        <div style={{ width: '150px', height: '24px', ...getShimmerStyle() }} />
      </div>
      <div style={{ width: '100%', height: '12px', marginBottom: '8px', ...getShimmerStyle() }} />
      <div style={{ width: '100%', height: '12px', marginBottom: '8px', ...getShimmerStyle() }} />
      <div style={{ width: '70%', height: '12px', ...getShimmerStyle() }} />
    </div>
  );
}

export default SkeletonLoader;