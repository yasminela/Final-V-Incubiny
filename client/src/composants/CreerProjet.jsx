import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

function CreerProjet({ projetExistant, onClose, onSuccess }) {
  const { darkMode } = useTheme();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [secteur, setSecteur] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (projetExistant) {
      setTitre(projetExistant.titre || '');
      setDescription(projetExistant.description || '');
      setSecteur(projetExistant.secteur || '');
      setBudget(projetExistant.budget || '');
      setIsEditing(true);
    }
  }, [projetExistant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing) {
        // Modifier le projet existant
        await api.put(`/projets/${projetExistant._id}`, {
          titre, description, secteur, budget
        });
        alert(' Projet modifié avec succès !');
      } else {
        // Créer un nouveau projet
        await api.post('/projets', {
          titre, description, secteur, budget
        });
        alert(' Projet créé avec succès !');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert(' Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(' Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) return;
    
    setLoading(true);
    try {
      await api.delete(`/projets/${projetExistant._id}`);
      alert(' Projet supprimé avec succès !');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert(' Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: darkMode ? '#ffffff' : '#1e293b'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '16px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
      background: darkMode ? '#0f172a' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      marginBottom: '16px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '100px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px'
    },
    btnSave: {
      flex: 1,
      padding: '12px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    btnDelete: {
      padding: '12px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    btnCancel: {
      flex: 1,
      padding: '12px',
      background: '#e2e8f0',
      color: '#475569',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>
          {isEditing ? ' Modifier le projet' : ' Nouveau projet'}
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Titre du projet"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            style={styles.input}
            required
          />
          
          <textarea
            placeholder="Description du projet"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            required
          />
          
          <input
            type="text"
            placeholder="Secteur d'activité (ex: Tech, Santé, Éducation...)"
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
            style={styles.input}
          />
          
          <input
            type="number"
            placeholder="Budget prévisionnel (€)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={styles.input}
          />
          
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.btnSave} disabled={loading}>
              {loading ? 'Chargement...' : (isEditing ? '💾 Enregistrer' : '✨ Créer')}
            </button>
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Annuler
            </button>
          </div>
          
          {isEditing && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button type="button" onClick={handleDelete} style={styles.btnDelete}>
                <FontAwesomeIcon icon={faTrash} /> Supprimer le projet
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreerProjet;