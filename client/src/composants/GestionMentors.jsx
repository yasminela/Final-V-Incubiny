import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faUpload, faEdit, faTrash, faCheckCircle, 
  faEye, faFilePdf, faStar, faGraduationCap, faClock, 
  faEnvelope, faSave, faSpinner
} from '@fortawesome/free-solid-svg-icons';

const defaultBlocsExpertise = {
  propositionValeur: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  segmentsClients: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  canaux: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  relationsClients: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  fluxRevenus: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  ressourcesCles: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  activitesCles: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  partenariatsCles: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] },
  structureCouts: { niveau: 0, anneesExperience: 0, motsClesMaitrises: [] }
};

const defaultFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  expertiseBMC: {
    niveauGlobal: 3,
    blocsExpertise: defaultBlocsExpertise,
    methodologies: []
  },
  disponibilite: { heuresParSemaine: 5 },
  estDisponible: true
};

function GestionMentors() {
  const { darkMode } = useTheme();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [cvFile, setCvFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mentors');
      setMentors(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedMentor) {
        await api.put(`/mentors/${selectedMentor._id}`, formData);
        alert('✅ Mentor modifié');
      } else {
        await api.post('/mentors', formData);
        alert('✅ Mentor créé');
      }
      setShowModal(false);
      setSelectedMentor(null);
      setFormData({ ...defaultFormData });
      loadMentors();
    } catch (error) {
      alert('❌ Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleScanCV = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    setScanning(true);
    const formDataUpload = new FormData();
    formDataUpload.append('cv', cvFile);

    try {
      const res = await api.post('/mentors/scan-cv', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        alert('✅ CV analysé avec succès');
        const mentorData = res.data.mentor;
        setFormData({
          ...defaultFormData,
          firstName: mentorData.firstName || '',
          lastName: mentorData.lastName || '',
          email: mentorData.email || '',
          phone: mentorData.phone || '',
          bio: mentorData.bio || '',
          expertiseBMC: {
            ...defaultFormData.expertiseBMC,
            niveauGlobal: mentorData.expertiseBMC?.niveauGlobal || 3,
            blocsExpertise: { ...defaultBlocsExpertise, ...mentorData.expertiseBMC?.blocsExpertise }
          },
          disponibilite: mentorData.disponibilite || { heuresParSemaine: 5 }
        });
        setShowScanModal(false);
        setShowModal(true);
        setCvFile(null);
      }
    } catch (error) {
      alert('❌ Erreur analyse: ' + (error.response?.data?.message || error.message));
    } finally {
      setScanning(false);
    }
  };

  const handleEdit = (mentor) => {
    setSelectedMentor(mentor);
    setFormData({
      firstName: mentor.firstName || '',
      lastName: mentor.lastName || '',
      email: mentor.email || '',
      phone: mentor.phone || '',
      bio: mentor.bio || '',
      expertiseBMC: {
        niveauGlobal: mentor.expertiseBMC?.niveauGlobal || 3,
        blocsExpertise: { ...defaultBlocsExpertise, ...mentor.expertiseBMC?.blocsExpertise },
        methodologies: mentor.expertiseBMC?.methodologies || []
      },
      disponibilite: mentor.disponibilite || { heuresParSemaine: 5 },
      estDisponible: mentor.estDisponible !== undefined ? mentor.estDisponible : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('⚠️ Supprimer ce mentor ?')) return;
    try {
      await api.delete(`/mentors/${id}`);
      alert('✅ Mentor supprimé');
      loadMentors();
    } catch (error) {
      alert('❌ Erreur suppression');
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/mentors/${id}/verifier`);
      alert('✅ Mentor vérifié');
      loadMentors();
    } catch (error) {
      alert('❌ Erreur vérification');
    }
  };

  const getNiveauStars = (niveau) => {
    if (!niveau) niveau = 0;
    return '★'.repeat(Math.min(5, Math.max(0, niveau))) + '☆'.repeat(5 - Math.min(5, Math.max(0, niveau)));
  };

  const styles = {
    container: { background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: darkMode ? '#ffffff' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
    btnPrimary: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#f1f5f9' : '#1e293b', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'left', background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#cbd5e1' : '#475569', borderBottom: `2px solid ${darkMode ? '#475569' : '#e2e8f0'}` },
    td: { padding: '12px', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, color: darkMode ? '#e2e8f0' : '#475569' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '24px', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: darkMode ? '#ffffff' : '#1e293b', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, paddingBottom: '12px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: darkMode ? '#cbd5e1' : '#475569' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f1f5f9' : '#1e293b' },
    badge: (verified) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: verified ? '#d1fae5' : '#fef3c7', color: verified ? '#059669' : '#d97706' }),
    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginRight: '4px', borderRadius: '6px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    uploadZone: { border: `2px dashed ${darkMode ? '#475569' : '#cbd5e1'}`, borderRadius: '16px', padding: '30px', textAlign: 'center', cursor: 'pointer', marginBottom: '20px' },
    emptyState: { textAlign: 'center', padding: '60px', color: darkMode ? '#94a3b8' : '#64748b' }
  };

  if (loading) {
    return <div style={styles.container}>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}><FontAwesomeIcon icon={faGraduationCap} color="#667eea" /> Gestion des mentors (Focus BMC)</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={styles.btnSecondary} onClick={() => setShowScanModal(true)}><FontAwesomeIcon icon={faUpload} /> Scanner CV</button>
          <button style={styles.btnPrimary} onClick={() => { setSelectedMentor(null); setFormData({ ...defaultFormData }); setShowModal(true); }}><FontAwesomeIcon icon={faUserPlus} /> Nouveau mentor</button>
        </div>
      </div>

      {mentors.length === 0 ? (
        <div style={styles.emptyState}>Aucun mentor</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nom</th><th style={styles.th}>Email</th><th style={styles.th}>Expertise BMC</th><th style={styles.th}>Proposition valeur</th><th style={styles.th}>Statut</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {mentors.map(mentor => (
                <tr key={mentor._id}>
                  <td style={styles.td}><strong>{mentor.firstName} {mentor.lastName}</strong></td>
                  <td style={styles.td}>{mentor.email}</td>
                  <td style={styles.td}>{getNiveauStars(mentor.expertiseBMC?.niveauGlobal || 0)}</td>
                  <td style={styles.td}>{getNiveauStars(mentor.expertiseBMC?.blocsExpertise?.propositionValeur?.niveau || 0)}</td>
                  <td style={styles.td}><span style={styles.badge(mentor.estVerifie)}>{mentor.estVerifie ? '✅ Vérifié' : '⏳ En attente'}</span></td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => setSelectedMentor(mentor) || setShowDetailModal(true)}><FontAwesomeIcon icon={faEye} color="#3b82f6" size="lg" /></button>
                    <button style={styles.actionBtn} onClick={() => handleEdit(mentor)}><FontAwesomeIcon icon={faEdit} color="#f59e0b" size="lg" /></button>
                    <button style={styles.actionBtn} onClick={() => handleDelete(mentor._id)}><FontAwesomeIcon icon={faTrash} color="#ef4444" size="lg" /></button>
                    {!mentor.estVerifie && <button style={styles.actionBtn} onClick={() => handleVerify(mentor._id)}><FontAwesomeIcon icon={faCheckCircle} color="#10b981" size="lg" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals... (similaires à la version précédente) */}
      {showScanModal && (
        <div style={styles.modalOverlay} onClick={() => setShowScanModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}><FontAwesomeIcon icon={faFilePdf} /> Scanner un CV</div>
            <form onSubmit={handleScanCV}>
              <div style={styles.uploadZone} onClick={() => document.getElementById('cvFile').click()}>
                <FontAwesomeIcon icon={faUpload} size="3x" /><p>Cliquez pour télécharger le CV (PDF)</p>
                <input type="file" id="cvFile" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setCvFile(e.target.files[0])} />
                {cvFile && <p style={{ marginTop: '12px', color: '#10b981' }}>✅ {cvFile.name}</p>}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowScanModal(false)}>Annuler</button>
                <button type="submit" style={styles.btnPrimary} disabled={scanning}>{scanning ? <><FontAwesomeIcon icon={faSpinner} spin /> Analyse...</> : <><FontAwesomeIcon icon={faFilePdf} /> Analyser</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{selectedMentor ? '✏️ Modifier' : '➕ Nouveau mentor'}</div>
            <form onSubmit={handleSubmit}>
              <div style={styles.grid2}>
                <div><label style={styles.label}>Prénom</label><input style={styles.input} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required /></div>
                <div><label style={styles.label}>Nom</label><input style={styles.input} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required /></div>
              </div>
              <div><label style={styles.label}>Email</label><input type="email" style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
              <div><label style={styles.label}>Bio</label><textarea style={{...styles.input, minHeight: '80px'}} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
              <div><label style={styles.label}>Niveau expertise BMC (1-5)</label>
                <select style={styles.select} value={formData.expertiseBMC?.niveauGlobal} onChange={e => setFormData({...formData, expertiseBMC: {...formData.expertiseBMC, niveauGlobal: parseInt(e.target.value)}})}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{getNiveauStars(n)} - Niveau {n}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Expertise Proposition de Valeur (1-5)</label>
                <select style={styles.select} value={formData.expertiseBMC?.blocsExpertise?.propositionValeur?.niveau || 0} onChange={e => setFormData({
                  ...formData, expertiseBMC: {...formData.expertiseBMC, blocsExpertise: {...formData.expertiseBMC?.blocsExpertise, propositionValeur: {...formData.expertiseBMC?.blocsExpertise?.propositionValeur, niveau: parseInt(e.target.value)}}}
                })}>
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'Non renseigné' : getNiveauStars(n)}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Disponibilité (h/semaine)</label><input type="number" style={styles.input} value={formData.disponibilite?.heuresParSemaine} onChange={e => setFormData({...formData, disponibilite: {heuresParSemaine: parseInt(e.target.value)}})} /></div>
              <div><label><input type="checkbox" checked={formData.estDisponible} onChange={e => setFormData({...formData, estDisponible: e.target.checked})} /> Mentor disponible</label></div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" style={styles.btnPrimary} disabled={saving}>{saving ? <><FontAwesomeIcon icon={faSpinner} spin /> Enregistrement...</> : <><FontAwesomeIcon icon={faSave} /> Enregistrer</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedMentor && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Détails du mentor</div>
            <div><strong>Nom:</strong> {selectedMentor.firstName} {selectedMentor.lastName}</div>
            <div><strong>Email:</strong> {selectedMentor.email}</div>
            <div><strong>Expertise BMC:</strong> {getNiveauStars(selectedMentor.expertiseBMC?.niveauGlobal || 0)}</div>
            <div><strong>Proposition valeur:</strong> {getNiveauStars(selectedMentor.expertiseBMC?.blocsExpertise?.propositionValeur?.niveau || 0)}</div>
            <div><strong>Disponibilité:</strong> {selectedMentor.disponibilite?.heuresParSemaine || 5}h/semaine</div>
            {selectedMentor.bio && <div><strong>Bio:</strong> {selectedMentor.bio}</div>}
            <button style={{ ...styles.btnPrimary, marginTop: '20px', width: '100%' }} onClick={() => setShowDetailModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionMentors;