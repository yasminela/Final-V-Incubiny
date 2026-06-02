import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../composants/Navbar';
import Calendrier from '../composants/Calendrier';
import SuiviEtapes from '../composants/SuiviEtapes';
import CreerProjet from '../composants/CreerProjet';
import PiedDePage from '../composants/PiedDePage';
import AvatarManager from '../composants/AvatarManager';
import GestionAnalysesIA from '../composants/GestionAnalysesIA';
import ValidationDocument from '../composants/ValidationDocument';
import EarlyStageTimeline from '../composants/EarlyStageTimeline';
import ToastNotification from '../composants/ui/ToastNotification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faFileAlt, faEye, faCheck, faTimes, 
  faExclamationTriangle, faBuilding, faTasks, faUpload,
  faRocket, faClipboardList, faUserGraduate, faAward,
  faCalendar, faBell, faHistory, faSpinner, faRobot,
  faEdit, faTrash, faPlus
} from '@fortawesome/free-solid-svg-icons';

function TableauBordPorteur({ user, onLogout }) {
  const { darkMode } = useTheme();
  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);
  const [etapes, setEtapes] = useState([]);
  const [showCreerProjet, setShowCreerProjet] = useState(false);
  const [showEditProjet, setShowEditProjet] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [stats, setStats] = useState({ projetsCount: 0, tachesCount: 0, etapesCount: 0, progression: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [soumissions, setSoumissions] = useState([]);
  const [toast, setToast] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const colors = {
    primary: '#9333ea',
    primaryLight: '#a855f7',
    secondary: '#ec4899',
    gradient1: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #06b6d4 100%)',
    gradient2: 'linear-gradient(135deg, #7e22ce 0%, #db2777 100%)'
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadUserProfile(),
          loadData(),
          loadSoumissions()
        ]);
      } catch (error) {
        console.error('Erreur initialisation:', error);
        showToastMessage('error', 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, []);

  const showToastMessage = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUserProfile = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const loadData = async () => {
    try {
      const [projetsRes, tachesRes, etapesRes] = await Promise.all([
        api.get('/projets/mes-projets'),
        api.get('/taches/mes-taches'),
        api.get('/etapes/mes-etapes')
      ]);
      
      setProjets(projetsRes.data || []);
      setTaches(tachesRes.data || []);
      setEtapes(etapesRes.data || []);

      const etapesData = etapesRes.data || [];
      const etapesValidees = etapesData.filter(e => e.statut === 'validee').length;
      const totalEtapes = etapesData.length;
      const progression = totalEtapes > 0 ? Math.round((etapesValidees / totalEtapes) * 100) : 0;
      const etapesRestantes = etapesData.filter(e => e.statut !== 'validee').length;

      setStats({
        projetsCount: projetsRes.data?.length || 0,
        tachesCount: tachesRes.data?.filter(t => !t.estComplete).length || 0,
        etapesCount: etapesRestantes,
        progression: progression
      });
    } catch (error) {
      console.error('Erreur chargement data:', error);
      throw error;
    }
  };

  const loadSoumissions = async () => {
    try {
      const res = await api.get('/etapes/mes-soumissions');
      setSoumissions(res.data || []);
    } catch (error) {
      console.error('Erreur chargement soumissions:', error);
    }
  };

  const handleAvatarUpdate = (newAvatar) => {
    setCurrentUser(prev => ({ ...prev, avatar: newAvatar }));
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.avatar = newAvatar;
    localStorage.setItem('user', JSON.stringify(storedUser));
    showToastMessage('success', 'Photo de profil mise à jour !');
  };

  const handleDeleteProjet = async (projetId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      await api.delete(`/projets/${projetId}`);
      showToastMessage('success', 'Projet supprimé');
      await Promise.all([loadData(), loadSoumissions()]);
    } catch (error) {
      console.error('Erreur suppression:', error);
      showToastMessage('error', 'Erreur lors de la suppression');
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { background: '#fef3c7', color: '#d97706', text: 'En attente', icon: faExclamationTriangle },
      valide: { background: '#d1fae5', color: '#059669', text: 'Validé', icon: faCheck },
      rejete: { background: '#fee2e2', color: '#dc2626', text: 'Rejeté', icon: faTimes }
    };
    const b = badges[statut] || badges.en_attente;
    return (
      <span style={{ background: b.background, color: b.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <FontAwesomeIcon icon={b.icon} size="sm" color={b.color} />
        {b.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8fafc' }}>
        <Navbar user={currentUser} onLogout={onLogout} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 70px)',
          gap: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <img src="/logo-incubiny.png" alt="Incubiny" style={{ width: '45px', height: '45px', filter: 'brightness(0) invert(1)' }} />
          </div>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(147, 51, 234, 0.2)',
            borderTop: '3px solid #9333ea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: darkMode ? '#94a3b8' : '#475569', fontSize: '14px' }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
            Chargement de votre espace porteur...
          </p>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
          `
        }} />
      </div>
    );
  }

  const styles = {
    container: { 
      padding: 'clamp(16px, 4vw, 24px)', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 200px)',
      position: 'relative',
      zIndex: 1
    },
    backgroundDecoration: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: darkMode ? '#0f172a' : '#f8fafc',
      zIndex: 0
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: darkMode ? 'radial-gradient(circle at 0% 0%, rgba(147, 51, 234, 0.15) 0%, rgba(236, 72, 153, 0.08) 50%, rgba(6, 182, 212, 0.05) 100%)' : 'radial-gradient(circle at 0% 0%, rgba(147, 51, 234, 0.08) 0%, rgba(236, 72, 153, 0.05) 50%, rgba(6, 182, 212, 0.03) 100%)',
      zIndex: 1
    },
    headerCard: { 
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '20px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      position: 'relative',
      zIndex: 2
    },
    userInfo: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    userName: { 
      fontSize: 'clamp(20px, 5vw, 24px)', 
      fontWeight: 'bold', 
      marginBottom: '4px',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    userEmail: { 
      color: darkMode ? '#cbd5e1' : '#475569',
      fontSize: '13px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px' 
    },
    userRole: { 
      marginTop: '8px',
      background: colors.gradient2,
      color: 'white', 
      padding: '4px 12px', 
      borderRadius: '20px', 
      fontSize: '11px',
      display: 'inline-block'
    },
    statsGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px', 
      marginBottom: '24px',
      position: 'relative',
      zIndex: 2
    },
    statCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      padding: '20px',
      borderRadius: '20px',
      textAlign: 'center',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    statValue: { 
      fontSize: 'clamp(28px, 5vw, 36px)', 
      fontWeight: 'bold', 
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    statLabel: { 
      fontSize: '13px', 
      color: darkMode ? '#cbd5e1' : '#64748b',
      marginTop: '6px' 
    },
    progressionCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '24px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      position: 'relative',
      zIndex: 2
    },
    progressionTitle: { 
      fontSize: '18px', 
      fontWeight: 'bold', 
      marginBottom: '16px', 
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px' 
    },
    progressionBar: { 
      background: darkMode ? '#334155' : '#e2e8f0', 
      borderRadius: '10px', 
      height: '8px', 
      overflow: 'hidden', 
      marginTop: '12px' 
    },
    progressionFill: { 
      background: colors.gradient1, 
      height: '100%', 
      width: `${stats.progression}%`, 
      borderRadius: '10px' 
    },
    progressionText: { 
      fontSize: '13px', 
      color: darkMode ? '#cbd5e1' : '#64748b',
      marginTop: '12px' 
    },
    infoCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '24px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      position: 'relative',
      zIndex: 2
    },
    sectionTitle: { 
      fontSize: '18px', 
      fontWeight: 'bold', 
      marginBottom: '16px', 
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      borderLeft: `4px solid ${colors.primary}`,
      paddingLeft: '16px' 
    },
    projetCard: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    projetInfo: { flex: 1 },
    projetTitre: { fontSize: '16px', fontWeight: 'bold', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '8px' },
    projetDescription: { fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px' },
    projetMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' },
    projetActions: { display: 'flex', gap: '8px' },
    btnEdit: {
      background: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px'
    },
    btnDelete: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px'
    },
    emptyState: { 
      textAlign: 'center', 
      padding: '40px', 
      color: darkMode ? '#cbd5e1' : '#64748b'
    },
    tabsContainer: { 
      display: 'flex', 
      gap: '8px', 
      marginBottom: '24px', 
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
      paddingBottom: '12px', 
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 2
    },
    tab: (active) => ({
      padding: '10px 20px',
      background: active ? colors.gradient1 : 'transparent',
      color: active ? 'white' : (darkMode ? '#94a3b8' : '#475569'),
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    }),
    programImagesContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
      position: 'relative',
      zIndex: 2
    },
    programImageCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '16px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      transition: 'transform 0.2s',
      textAlign: 'center'
    },
    programImage: {
      width: '100%',
      borderRadius: '12px',
      marginBottom: '12px'
    },
    programCaption: {
      fontSize: '13px',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '8px',
      fontWeight: '500'
    },
    soumissionsBadge: {
      background: colors.primary,
      color: 'white',
      borderRadius: '20px',
      padding: '2px 8px',
      fontSize: '12px',
      marginLeft: '8px'
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: darkMode ? '#0f172a' : '#f8fafc' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          .btn-shine { position: relative; overflow: hidden; transition: all 0.3s ease; }
          .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.5s ease; }
          .btn-shine:hover::before { left: 100%; }
          .btn-shine:hover { transform: translateY(-2px); }
          .stat-card:hover, .program-card:hover { transform: translateY(-5px); }
        `
      }} />

      <div style={styles.backgroundDecoration}>
        <div style={styles.gradientOverlay} />
      </div>

      <Navbar user={currentUser} onLogout={onLogout} />
      
      <div style={styles.container}>
        <div style={styles.headerCard}>
          <div style={styles.userInfo}>
            <AvatarManager user={currentUser} onAvatarUpdate={handleAvatarUpdate} size="large" />
            <div>
              <h1 style={styles.userName}>{currentUser?.firstName} {currentUser?.lastName}</h1>
              <div style={styles.userEmail}>
                <span>📧</span>
                {currentUser?.email}
              </div>
              <div style={styles.userRole}>
                <FontAwesomeIcon icon={faUserGraduate} style={{ marginRight: '6px' }} />
                Porteur de projet - Programme Early Stage
              </div>
            </div>
          </div>
        </div>

        <div style={styles.tabsContainer}>
          <button className="btn-shine" style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
            <FontAwesomeIcon icon={faChartLine} /> Tableau de bord
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'programme')} onClick={() => setActiveTab('programme')}>
            <FontAwesomeIcon icon={faRocket} /> Mon programme
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'soumissions')} onClick={() => setActiveTab('soumissions')}>
            <FontAwesomeIcon icon={faUpload} /> Mes soumissions 
            {soumissions.filter(s => s.statut === 'soumise').length > 0 && (
              <span style={styles.soumissionsBadge}>{soumissions.filter(s => s.statut === 'soumise').length}</span>
            )}
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'analyses')} onClick={() => setActiveTab('analyses')}>
            <FontAwesomeIcon icon={faRobot} /> Analyses IA
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div style={styles.statsGrid}>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statValue}>{stats.projetsCount}</div>
                <div style={styles.statLabel}>Mes projets</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statValue}>{stats.tachesCount}</div>
                <div style={styles.statLabel}>Tâches à faire</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statValue}>{stats.etapesCount}</div>
                <div style={styles.statLabel}>Étapes restantes</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statValue}>{soumissions.filter(s => s.statut === 'soumise').length}</div>
                <div style={styles.statLabel}>En attente de validation</div>
              </div>
            </div>

            <div style={styles.progressionCard}>
              <div style={styles.progressionTitle}>
                <FontAwesomeIcon icon={faAward} color={colors.primary} />
                Progression du programme
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#64748b' }}>6 mois d'accompagnement</span>
                <span style={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : '#1e293b' }}>{stats.progression}%</span>
              </div>
              <div style={styles.progressionBar}>
                <div style={styles.progressionFill} />
              </div>
              <div style={styles.progressionText}>
                {stats.progression === 0 ? 'Commencez votre parcours !' : 
                 stats.progression === 100 ? 'Félicitations ! Programme terminé !' : 
                 `Continuez, vous êtes à ${stats.progression}%`}
              </div>
            </div>

            <Calendrier />

            <div style={styles.infoCard}>
              <div style={styles.sectionTitle}>
                <FontAwesomeIcon icon={faBuilding} color={colors.primary} /> 
                Mes projets
              </div>
              {projets.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>Aucun projet</p>
                  <button className="btn-shine" onClick={() => setShowCreerProjet(true)} style={{ ...styles.btnEdit, marginTop: '16px' }}>
                    <FontAwesomeIcon icon={faPlus} /> Créer mon premier projet
                  </button>
                </div>
              ) : (
                projets.map(p => (
                  <div key={p._id} style={styles.projetCard}>
                    <div style={styles.projetInfo}>
                      <div style={styles.projetTitre}>{p.titre || p.nomProjet}</div>
                      <div style={styles.projetDescription}>{p.description || '—'}</div>
                      <div style={styles.projetMeta}>
                        <span>{p.secteur || 'Non spécifié'}</span>
                        {p.budget && <span>💰 {p.budget.toLocaleString()} €</span>}
                        <span>{getStatutBadge(p.statut)}</span>
                      </div>
                    </div>
                    <div style={styles.projetActions}>
                      {p.statut === 'en_attente' && (
                        <>
                          <button className="btn-shine" onClick={() => { setSelectedProjet(p); setShowEditProjet(true); }} style={styles.btnEdit}>
                            <FontAwesomeIcon icon={faEdit} size="sm" /> Modifier
                          </button>
                          <button className="btn-shine" onClick={() => handleDeleteProjet(p._id)} style={styles.btnDelete}>
                            <FontAwesomeIcon icon={faTrash} size="sm" /> Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'programme' && (
          <>
            <div style={styles.programImagesContainer}>
              <div className="program-card" style={styles.programImageCard}>
                <img src="/prog1.png" alt="Master Plan" style={styles.programImage} onError={(e) => e.target.style.display = 'none'} />
                <p style={styles.programCaption}>Le Master Plan : 3 Phases de Transformation</p>
              </div>
              <div className="program-card" style={styles.programImageCard}>
                <img src="/prog2.png" alt="Écosystème Dual" style={styles.programImage} onError={(e) => e.target.style.display = 'none'} />
                <p style={styles.programCaption}>La Matrice de Soutien : Un Écosystème Dual</p>
              </div>
            </div>
            <EarlyStageTimeline />
            <SuiviEtapes />
          </>
        )}

        {activeTab === 'soumissions' && (
          <ValidationDocument onValidate={() => loadSoumissions()} />
        )}

        {activeTab === 'analyses' && <GestionAnalysesIA />}
      </div>

      <PiedDePage />

      {showCreerProjet && (
        <CreerProjet 
          onClose={() => setShowCreerProjet(false)} 
          onSuccess={() => { loadData(); showToastMessage('success', 'Projet créé !'); }} 
        />
      )}

      {showEditProjet && selectedProjet && (
        <CreerProjet 
          projetExistant={selectedProjet}
          onClose={() => { setShowEditProjet(false); setSelectedProjet(null); }} 
          onSuccess={() => { loadData(); showToastMessage('success', 'Projet modifié !'); }} 
        />
      )}
      
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
    </div>
  );
}

export default TableauBordPorteur;