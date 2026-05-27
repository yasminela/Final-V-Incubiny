import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../composants/Navbar';
import Calendrier from '../composants/Calendrier';
import GestionMentors from '../composants/GestionMentors';
import CreationPorteur from '../composants/CreationPorteur';
import EnvoiTache from '../composants/EnvoiTache';
import ModifierPorteur from '../composants/ModifierPorteur';
import ValidationDocument from '../composants/ValidationDocument';
import ValidationProjet from '../composants/ValidationProjet';
import AssignerEtapes from '../composants/AssignerEtapes';
import EarlyStageTimeline from '../composants/EarlyStageTimeline';
import ScoresPorteurs from '../composants/ScoresPorteurs';
import AdminAnalysesIA from '../composants/AdminAnalysesIA';
import AvatarManager from '../composants/AvatarManager';
import ToastNotification from '../composants/ui/ToastNotification';
import PiedDePage from '../composants/PiedDePage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faUsers, faBuilding, faFileAlt, faEye, 
  faUserPlus, faPaperPlane, faTasks, faUserCircle, 
  faExclamationTriangle, faEdit, faTrash, faCheck, faTimes,
  faTachometerAlt, faSpinner, faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

function TableauBordAdmin({ user, onLogout }) {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({ projets: 0, porteurs: 0, soumissions: 0 });
  const [porteurs, setPorteurs] = useState([]);
  const [projets, setProjets] = useState([]);
  const [showCreationPorteur, setShowCreationPorteur] = useState(false);
  const [showEnvoiTache, setShowEnvoiTache] = useState(false);
  const [showEditPorteur, setShowEditPorteur] = useState(false);
  const [showAssignerEtapes, setShowAssignerEtapes] = useState(false);
  const [showValidationProjet, setShowValidationProjet] = useState(false);
  const [selectedPorteur, setSelectedPorteur] = useState(null);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(user);
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
    const initializeAdminDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadUserProfile(),
          loadAllData()
        ]);
      } catch (error) {
        console.error('Erreur initialisation:', error);
        showToastMessage('error', 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAdminDashboard();
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

  const loadAllData = async () => {
    try {
      const [projetsRes, utilisateursRes, soumissionsRes] = await Promise.all([
        api.get('/projets/tous'),
        api.get('/utilisateurs'),
        api.get('/etapes/soumissions')
      ]);
      
      setStats({
        projets: projetsRes.data?.filter(p => p.statut === 'en_attente').length || 0,
        porteurs: utilisateursRes.data?.filter(u => u.role === 'porteur').length || 0,
        soumissions: soumissionsRes.data?.length || 0
      });
      setPorteurs(utilisateursRes.data?.filter(u => u.role === 'porteur') || []);
      setProjets(projetsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement data:', error);
      throw error;
    }
  };

  const handleAvatarUpdate = (newAvatar) => {
    setCurrentUser(prev => ({ ...prev, avatar: newAvatar }));
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.avatar = newAvatar;
    localStorage.setItem('user', JSON.stringify(storedUser));
    showToastMessage('success', 'Photo de profil mise à jour !');
  };

  const handleDeletePorteur = async (id) => {
    if (!window.confirm('⚠️ Supprimer ce porteur ?')) return;
    
    try {
      await api.delete(`/utilisateurs/${id}`);
      await loadAllData();
      showToastMessage('success', '✅ Porteur supprimé');
    } catch (error) {
      showToastMessage('error', '❌ Erreur suppression');
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { background: '#fef3c7', color: '#d97706', text: '⏳ En attente', icon: faExclamationTriangle },
      valide: { background: '#d1fae5', color: '#059669', text: '✅ Validé', icon: faCheck },
      rejete: { background: '#fee2e2', color: '#dc2626', text: '❌ Rejeté', icon: faTimes }
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
            Chargement du tableau de bord...
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
      padding: 'clamp(16px, 5vw, 24px)', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      minHeight: 'calc(100vh - 200px)',
      position: 'relative',
      zIndex: 1
    },
    profileCard: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '24px', 
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`
    },
    profileInfo: { flex: 1 },
    profileName: { 
      fontSize: 'clamp(20px, 4vw, 24px)', 
      fontWeight: 'bold', 
      marginBottom: '4px', 
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    profileEmail: { 
      color: darkMode ? '#cbd5e1' : '#475569', 
      marginBottom: '8px', 
      fontSize: 'clamp(12px, 3vw, 14px)' 
    },
    profileBadge: {
      background: colors.gradient2,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      display: 'inline-block'
    },
    statsContainer: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: 'clamp(16px, 3vw, 24px)', 
      marginBottom: '32px'
    },
    statCard: {
      padding: 'clamp(16px, 4vw, 24px)',
      borderRadius: '24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: '160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`
    },
    statNumber: { 
      fontSize: 'clamp(28px, 5vw, 36px)', 
      fontWeight: 'bold', 
      marginBottom: '8px', 
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    statLabel: { 
      fontSize: 'clamp(12px, 3vw, 14px)', 
      color: darkMode ? '#94a3b8' : '#64748b' 
    },
    buttonGroup: { 
      display: 'flex', 
      gap: '16px', 
      marginBottom: '30px', 
      flexWrap: 'wrap'
    },
    actionBtn: { 
      padding: 'clamp(10px, 2vw, 12px) clamp(16px, 4vw, 24px)', 
      border: 'none', 
      borderRadius: '12px', 
      cursor: 'pointer', 
      fontWeight: 'bold', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      transition: 'all 0.3s ease',
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    btnPrimary: { background: colors.gradient1, color: 'white' },
    btnSuccess: { background: '#10b981', color: 'white' },
    btnPurple: { background: colors.gradient2, color: 'white' },
    infoCard: { 
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px', 
      padding: 'clamp(16px, 4vw, 24px)', 
      marginBottom: '24px', 
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`
    },
    sectionTitle: { 
      fontSize: 'clamp(18px, 4vw, 20px)', 
      fontWeight: 'bold', 
      marginBottom: '20px', 
      color: darkMode ? '#f1f5f9' : '#1e293b',
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      borderLeft: `4px solid ${colors.primary}`, 
      paddingLeft: '16px' 
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { 
      padding: 'clamp(10px, 2vw, 14px)', 
      textAlign: 'left', 
      background: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)', 
      color: darkMode ? '#94a3b8' : '#475569',
      fontWeight: '600', 
      fontSize: 'clamp(12px, 2.5vw, 14px)', 
      borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    td: { 
      padding: 'clamp(10px, 2vw, 14px)', 
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
      fontSize: 'clamp(12px, 2.5vw, 14px)', 
      color: darkMode ? '#e2e8f0' : '#475569'
    },
    btnEdit: { background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' },
    btnDelete: { background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' },
    btnValidate: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: 'clamp(30px, 8vw, 48px)', color: darkMode ? '#94a3b8' : '#64748b' },
    tabsContainer: { 
      display: 'flex', 
      gap: '8px', 
      marginBottom: '24px', 
      paddingBottom: '12px', 
      flexWrap: 'wrap',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
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
    programCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    programCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '16px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.2)'}`,
      transition: 'transform 0.2s',
      cursor: 'pointer'
    },
    programImage: {
      width: '100%',
      borderRadius: '12px',
      marginBottom: '12px'
    },
    programCaption: {
      fontSize: '14px',
      textAlign: 'center',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '8px'
    },
    projetCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.15)'}`
    },
    projetInfo: { flex: 1 },
    projetTitre: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: darkMode ? '#f1f5f9' : '#1e293b' },
    projetMeta: { fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }
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
          .overflow-x-auto { overflow-x: auto; }
        `
      }} />

      <Navbar user={currentUser} onLogout={onLogout} />
      
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <AvatarManager user={currentUser} onAvatarUpdate={handleAvatarUpdate} />
            <div style={styles.profileInfo}>
              <h1 style={styles.profileName}>{currentUser?.firstName} {currentUser?.lastName}</h1>
              <p style={styles.profileEmail}>{currentUser?.email}</p>
              <span style={styles.profileBadge}>
                <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: '6px' }} /> 
                Administrateur
              </span>
            </div>
          </div>
        </div>

        <div style={styles.programCards}>
          <div className="program-card" style={styles.programCard}>
            <img src="/prog1.png" alt="Master Plan" style={styles.programImage} onError={(e) => e.target.style.display = 'none'} />
            <p style={styles.programCaption}>Le Master Plan : 3 Phases de Transformation</p>
          </div>
          <div className="program-card" style={styles.programCard}>
            <img src="/prog2.png" alt="Écosystème Dual" style={styles.programImage} onError={(e) => e.target.style.display = 'none'} />
            <p style={styles.programCaption}>La Matrice de Soutien : Un Écosystème Dual</p>
          </div>
        </div>

        <EarlyStageTimeline />

        {/* Tabs Container */}
        <div style={styles.tabsContainer}>
          <button className="btn-shine" style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
            <FontAwesomeIcon icon={faTachometerAlt} /> Tableau de bord
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'porteurs')} onClick={() => setActiveTab('porteurs')}>
            <FontAwesomeIcon icon={faUsers} /> Porteurs ({porteurs.length})
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'projets')} onClick={() => setActiveTab('projets')}>
            <FontAwesomeIcon icon={faBuilding} /> Projets ({stats.projets})
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'soumissions')} onClick={() => setActiveTab('soumissions')}>
            <FontAwesomeIcon icon={faFileAlt} /> Soumissions ({stats.soumissions})
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'analyses')} onClick={() => setActiveTab('analyses')}>
            <FontAwesomeIcon icon={faEye} /> Analyses IA
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'scores')} onClick={() => setActiveTab('scores')}>
            <FontAwesomeIcon icon={faChartLine} /> Scores
          </button>
          <button className="btn-shine" style={styles.tab(activeTab === 'mentors')} onClick={() => setActiveTab('mentors')}>
            <FontAwesomeIcon icon={faGraduationCap} /> Mentors
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div style={styles.statsContainer}>
              <div className="stat-card" style={styles.statCard} onClick={() => setActiveTab('projets')}>
                <div style={styles.statNumber}>{stats.projets}</div>
                <div style={styles.statLabel}>Projets en attente</div>
              </div>
              <div className="stat-card" style={styles.statCard} onClick={() => setActiveTab('porteurs')}>
                <div style={styles.statNumber}>{stats.porteurs}</div>
                <div style={styles.statLabel}>Porteurs actifs</div>
              </div>
              <div className="stat-card" style={styles.statCard} onClick={() => setActiveTab('soumissions')}>
                <div style={styles.statNumber}>{stats.soumissions}</div>
                <div style={styles.statLabel}>Soumissions en attente</div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button className="btn-shine" onClick={() => setShowCreationPorteur(true)} style={{ ...styles.actionBtn, ...styles.btnPrimary }}>
                <FontAwesomeIcon icon={faUserPlus} /> Créer un porteur
              </button>
              <button className="btn-shine" onClick={() => setShowEnvoiTache(true)} style={{ ...styles.actionBtn, ...styles.btnSuccess }}>
                <FontAwesomeIcon icon={faPaperPlane} /> Envoyer une tâche
              </button>
              <button className="btn-shine" onClick={() => setShowAssignerEtapes(true)} style={{ ...styles.actionBtn, ...styles.btnPurple }}>
                <FontAwesomeIcon icon={faTasks} /> Assigner programme
              </button>
            </div>

            <Calendrier onEventAdded={loadAllData} />
            <ValidationDocument onValidate={loadAllData} />
          </>
        )}

        {/* Porteurs Tab */}
        {activeTab === 'porteurs' && (
          <div style={styles.infoCard}>
            <div style={styles.sectionTitle}>
              <FontAwesomeIcon icon={faUsers} /> Liste des porteurs
            </div>
            {porteurs.length === 0 ? (
              <div style={styles.emptyState}>Aucun porteur</div>
            ) : (
              <div className="overflow-x-auto">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nom</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Téléphone</th>
                      <th style={styles.th}>Projet</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porteurs.map(p => (
                      <tr key={p._id}>
                        <td style={styles.td}>{p.firstName} {p.lastName}</td>
                        <td style={styles.td}>{p.email}</td>
                        <td style={styles.td}>{p.telephone || '—'}</td>
                        <td style={styles.td}>{p.nomProjet || '—'}</td>
                        <td style={styles.td}>
                          <button className="btn-shine" onClick={() => { setSelectedPorteur(p); setShowEditPorteur(true); }} style={styles.btnEdit}>
                            <FontAwesomeIcon icon={faEdit} size="sm" /> Modifier
                          </button>
                          <button className="btn-shine" onClick={() => handleDeletePorteur(p._id)} style={styles.btnDelete}>
                            <FontAwesomeIcon icon={faTrash} size="sm" /> Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Projets Tab */}
        {activeTab === 'projets' && (
          <div style={styles.infoCard}>
            <div style={styles.sectionTitle}>
              <FontAwesomeIcon icon={faBuilding} /> Projets à valider
            </div>
            {projets.filter(p => p.statut === 'en_attente').length === 0 ? (
              <div style={styles.emptyState}>Aucun projet en attente</div>
            ) : (
              projets.filter(p => p.statut === 'en_attente').map(p => (
                <div key={p._id} style={styles.projetCard}>
                  <div style={styles.projetInfo}>
                    <div style={styles.projetTitre}>{p.titre || p.nomProjet}</div>
                    <div style={styles.projetMeta}>
                      Porteur: {p.porteurId?.firstName} {p.porteurId?.lastName}
                    </div>
                    <div style={{ marginTop: '8px' }}>{getStatutBadge(p.statut)}</div>
                  </div>
                  <button className="btn-shine" onClick={() => { setSelectedProjet(p); setShowValidationProjet(true); }} style={styles.btnValidate}>
                    <FontAwesomeIcon icon={faCheck} size="sm" /> Valider / Rejeter
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Soumissions Tab */}
        {activeTab === 'soumissions' && <ValidationDocument onValidate={loadAllData} />}
        
        {/* Analyses IA Tab */}
        {activeTab === 'analyses' && <AdminAnalysesIA />}
        
        {/* Scores Tab */}
        {activeTab === 'scores' && <ScoresPorteurs />}
        
        {/* Mentors Tab */}
        {activeTab === 'mentors' && <GestionMentors />}

      </div>

      <PiedDePage />

      {/* Modals */}
      {showCreationPorteur && (
        <CreationPorteur 
          onClose={() => setShowCreationPorteur(false)} 
          onSuccess={() => { loadAllData(); setShowCreationPorteur(false); }} 
        />
      )}
      
      {showEnvoiTache && (
        <EnvoiTache 
          onClose={() => setShowEnvoiTache(false)} 
          onSuccess={() => { loadAllData(); setShowEnvoiTache(false); }} 
        />
      )}
      
      {showAssignerEtapes && (
        <AssignerEtapes 
          onClose={() => setShowAssignerEtapes(false)} 
          onSuccess={() => { loadAllData(); setShowAssignerEtapes(false); }} 
        />
      )}
      
      {showEditPorteur && selectedPorteur && (
        <ModifierPorteur 
          porteur={selectedPorteur} 
          onClose={() => { setShowEditPorteur(false); setSelectedPorteur(null); }} 
          onSuccess={() => { loadAllData(); setShowEditPorteur(false); }} 
        />
      )}
      
      {showValidationProjet && selectedProjet && (
        <ValidationProjet 
          projet={selectedProjet} 
          onClose={() => { setShowValidationProjet(false); setSelectedProjet(null); }} 
          onSuccess={() => { loadAllData(); setShowValidationProjet(false); setSelectedProjet(null); }} 
        />
      )}
      
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
    </div>
  );
}

export default TableauBordAdmin;