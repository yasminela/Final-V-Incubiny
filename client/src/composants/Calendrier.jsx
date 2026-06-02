import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Icon from './Icon';
import { iconColors } from '../styles/iconColors';
import { useTheme } from '../context/ThemeContext';

function Calendrier({ onEventAdded }) {
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    type: 'formation',
    affiche: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get('/evenements/mes-evenements');
      setEvents(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/evenements', formData);
      alert(' Événement créé');
      setShowForm(false);
      setFormData({ titre: '', description: '', dateDebut: '', dateFin: '', lieu: '', type: 'formation', affiche: null });
      loadEvents();
      if (onEventAdded) onEventAdded();
    } catch (error) {
      alert(' Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('Supprimer cet événement ?')) {
      try {
        await api.delete(`/evenements/${id}`);
        loadEvents();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const getTypeStyle = (type) => {
    const typeStyles = {
      formation: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', emoji: '📚', icon: 'learning' },
      atelier: { bg: '#d1fae5', border: '#10b981', text: '#065f46', emoji: '🛠️', icon: 'users' },
      webinaire: { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', emoji: '💻', icon: 'development' },
      reunion: { bg: '#fed7aa', border: '#f59e0b', text: '#92400e', emoji: '👥', icon: 'group' },
      soutenance: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', emoji: '🎓', icon: 'rocket' }
    };
    return typeStyles[type] || typeStyles.formation;
  };

  const getTypeLabel = (type) => {
    const labels = {
      formation: 'Formation',
      atelier: 'Atelier',
      webinaire: 'Webinaire',
      reunion: 'Réunion',
      soutenance: 'Soutenance'
    };
    return labels[type] || 'Événement';
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startOffset = firstDay.getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter(e => {
      const eventDate = new Date(e.dateDebut);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthDays = getDaysInMonth();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const upcomingEvents = [...events]
    .filter(e => new Date(e.dateDebut) >= new Date())
    .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut))
    .slice(0, 5);

  // ========== DÉFINITION DES STYLES (avant le return) ==========
  const styles = {
    container: {
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.05)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      margin: 0,
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderLeft: `4px solid ${iconColors.primary}`,
      paddingLeft: '16px',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    addBtn: {
      background: iconColors.primary,
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    formContainer: {
      background: darkMode ? '#0f172a' : '#f5f7fa',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    },
    formTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      fontSize: '14px',
      fontFamily: 'inherit',
      background: darkMode ? '#1e293b' : 'white',
      color: 'var(--text-primary)'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      background: darkMode ? '#1e293b' : 'white',
      color: 'var(--text-primary)'
    },
    formButtons: { display: 'flex', gap: '12px', marginTop: '8px' },
    createBtn: {
      background: '#10b981',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    cancelBtn: {
      background: '#e2e8f0',
      color: '#475569',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    calendarNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    navButtons: { display: 'flex', gap: '8px' },
    navBtn: {
      background: '#e2e8f0',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    todayBtn: {
      background: iconColors.primary,
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    monthTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'var(--text-primary)'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      background: '#e2e8f0',
      border: `1px solid #e2e8f0`,
      borderRadius: '12px',
      overflow: 'hidden'
    },
    weekDay: {
      background: darkMode ? '#1e293b' : '#f1f5f9',
      padding: '12px',
      textAlign: 'center',
      fontWeight: 'bold',
      color: darkMode ? '#94a3b8' : '#64748b',
      fontSize: '13px'
    },
    dayCell: (isToday) => ({
      minHeight: '100px',
      padding: '8px',
      border: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`,
      background: isToday ? (darkMode ? '#2d3748' : '#e0e7ff') : (darkMode ? '#1e293b' : 'white')
    }),
    dayNumber: (isToday) => ({
      fontWeight: 'bold',
      fontSize: '14px',
      marginBottom: '8px',
      color: isToday ? iconColors.primary : 'var(--text-primary)'
    }),
    eventItem: (typeStyle) => ({
      background: typeStyle.bg,
      color: typeStyle.text,
      padding: '4px 8px',
      borderRadius: '6px',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      fontSize: '11px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    }),
    upcomingSection: { marginTop: '24px' },
    upcomingTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderLeft: `4px solid ${iconColors.primary}`,
      paddingLeft: '12px'
    },
    upcomingEvent: (typeStyle) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: typeStyle.bg,
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '10px'
    }),
    upcomingEventContent: { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' },
    upcomingEventInfo: { flex: 1 },
    upcomingEventTitle: (typeStyle) => ({ fontWeight: 'bold', marginBottom: '4px', color: typeStyle.text }),
    upcomingEventDate: (typeStyle) => ({ fontSize: '12px', color: typeStyle.text }),
    upcomingEventLieu: (typeStyle) => ({ fontSize: '12px', marginTop: '4px', color: typeStyle.text }),
    deleteEventBtn: {
      background: iconColors.danger,
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px'
    },
    legend: {
      marginTop: '20px',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      paddingTop: '16px'
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' },
    legendColor: { width: '12px', height: '12px', borderRadius: '3px' },
    emptyState: { textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }
  };
  // ========== FIN DE LA DÉFINITION DES STYLES ==========

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Icon name="calendar" size={22} color={iconColors.primary} />
          Calendrier des événements
        </h3>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            <Icon name="add_circle" size={18} color="white" /> Ajouter
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div style={styles.formContainer}>
          <div style={styles.formTitle}><Icon name="add_circle" size={16} color={iconColors.primary} /> Nouvel événement</div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <input type="text" placeholder="Titre *" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} required style={styles.input} />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={styles.input}>
                <option value="formation"> Formation</option>
                <option value="atelier"> Atelier</option>
                <option value="webinaire"> Webinaire</option>
                <option value="reunion"> Réunion</option>
                <option value="soutenance"> Soutenance</option>
              </select>
              <input type="datetime-local" value={formData.dateDebut} onChange={e => setFormData({...formData, dateDebut: e.target.value})} required style={styles.input} />
              <input type="datetime-local" value={formData.dateFin} onChange={e => setFormData({...formData, dateFin: e.target.value})} required style={styles.input} />
              <input type="text" placeholder="Lieu" value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})} style={styles.input} />
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.textarea} rows="2" />
            <div style={styles.formButtons}>
              <button type="submit" disabled={loading} style={styles.createBtn}>
                {loading ? <><Icon name="pending" size={14} color="white" /> Création...</> : <><Icon name="check_st" size={14} color="white" /> Créer</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.calendarNav}>
        <div style={styles.navButtons}>
          <button onClick={prevMonth} style={styles.navBtn}><Icon name="angle_left" size={18} color="#666" /></button>
          <button onClick={goToToday} style={styles.todayBtn}><Icon name="today" size={14} color="white" /> Aujourd'hui</button>
          <button onClick={nextMonth} style={styles.navBtn}><Icon name="angle_right" size={18} color="#666" /></button>
        </div>
        <h2 style={styles.monthTitle}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
      </div>

      <div style={styles.calendarGrid}>
        {weekDays.map(day => <div key={day} style={styles.weekDay}>{day}</div>)}
        {monthDays.map((date, index) => {
          const dayEvents = date ? getEventsForDay(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          return (
            <div key={index} style={styles.dayCell(isToday)}>
              {date && (
                <>
                  <div style={styles.dayNumber(isToday)}>{date.getDate()}</div>
                  <div style={{ fontSize: '10px' }}>
                    {dayEvents.slice(0, 3).map(event => {
                      const typeStyle = getTypeStyle(event.type);
                      return (
                        <div 
                          key={event._id} 
                          style={styles.eventItem(typeStyle)} 
                          title={`${event.titre}\nDu ${new Date(event.dateDebut).toLocaleString()}\nAu ${new Date(event.dateFin).toLocaleString()}\n${event.description || ''}`} 
                          onClick={() => alert(`${event.titre}\nDu ${new Date(event.dateDebut).toLocaleString()}\nAu ${new Date(event.dateFin).toLocaleString()}\n${event.description || ''}`)}
                        >
                          <Icon name={typeStyle.icon} size={8} color={typeStyle.text} /> {event.titre}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <div style={{ fontSize: '9px', color: '#666', marginTop: '3px' }}>+{dayEvents.length - 3}</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.upcomingSection}>
        <div style={styles.upcomingTitle}><Icon name="calendar_av_en" size={18} color={iconColors.primary} /> Événements à venir</div>
        {upcomingEvents.length === 0 ? (
          <div style={styles.emptyState}><Icon name="no_notification" size={32} color={iconColors.grayLight} /><p>Aucun événement à venir</p></div>
        ) : (
          upcomingEvents.map(event => {
            const typeStyle = getTypeStyle(event.type);
            return (
              <div key={event._id} style={styles.upcomingEvent(typeStyle)}>
                <div style={styles.upcomingEventContent}>
                  <div style={{ fontSize: '24px' }}>{typeStyle.emoji}</div>
                  <div style={styles.upcomingEventInfo}>
                    <div style={styles.upcomingEventTitle(typeStyle)}>{event.titre}</div>
                    <div style={styles.upcomingEventDate(typeStyle)}><Icon name="calendar" size={10} color={typeStyle.text} /> Du {new Date(event.dateDebut).toLocaleDateString('fr-FR')} au {new Date(event.dateFin).toLocaleDateString('fr-FR')}</div>
                    {event.lieu && <div style={styles.upcomingEventLieu(typeStyle)}><Icon name="marker" size={10} color={typeStyle.text} /> {event.lieu}</div>}
                    {event.description && <div style={{ fontSize: '11px', marginTop: '5px', color: typeStyle.text }}>{event.description}</div>}
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(event._id)} style={styles.deleteEventBtn}>
                    <Icon name="delete" size={12} color="white" /> Supprimer
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.legend}>
        {['formation', 'atelier', 'webinaire', 'reunion', 'soutenance'].map(type => {
          const typeStyle = getTypeStyle(type);
          return (
            <div key={type} style={styles.legendItem}>
              <div style={{ ...styles.legendColor, background: typeStyle.border }}></div>
              <span>{getTypeLabel(type)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendrier;