import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, faCalendarAlt, faCalendarPlus, faPlus, 
  faTimes, faChevronLeft, faChevronRight, faCalendarDay,
  faClock, faMapMarkerAlt, faInfoCircle, faTrashAlt,
  faSpinner, faCheck, faBook, faTools, faLaptopCode,
  faUsers, faGraduationCap, faBell, faBellSlash,
  faLayerGroup, faAngleLeft, faAngleRight
} from '@fortawesome/free-solid-svg-icons';

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
      formation: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: faBook, label: 'Formation' },
      atelier: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: faTools, label: 'Atelier' },
      webinaire: { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', icon: faLaptopCode, label: 'Webinaire' },
      reunion: { bg: '#fed7aa', border: '#f59e0b', text: '#92400e', icon: faUsers, label: 'Réunion' },
      soutenance: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', icon: faGraduationCap, label: 'Soutenance' }
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
      color: darkMode ? '#f1f5f9' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderLeft: `4px solid #9333ea`,
      paddingLeft: '16px',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    addBtn: {
      background: '#9333ea',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
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
      color: darkMode ? '#f1f5f9' : '#1e293b',
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
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      fontSize: '14px',
      fontFamily: 'inherit',
      background: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      cursor: 'pointer'
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
      color: darkMode ? '#f1f5f9' : '#1e293b'
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
      background: darkMode ? '#334155' : '#e2e8f0',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: darkMode ? '#f1f5f9' : '#475569'
    },
    todayBtn: {
      background: '#9333ea',
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
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      background: darkMode ? '#334155' : '#e2e8f0',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
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
      background: isToday ? (darkMode ? '#2d3748' : '#e0e7ff') : (darkMode ? '#1e293b' : 'white'),
      border: `1px solid ${darkMode ? '#334155' : '#f0f0f0'}`
    }),
    dayNumber: (isToday) => ({
      fontWeight: 'bold',
      fontSize: '14px',
      marginBottom: '8px',
      color: isToday ? '#9333ea' : (darkMode ? '#f1f5f9' : '#1e293b')
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
      color: darkMode ? '#f1f5f9' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderLeft: `4px solid #9333ea`,
      paddingLeft: '12px'
    },
    upcomingEvent: (typeStyle) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: typeStyle.bg,
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '10px',
      flexWrap: 'wrap',
      gap: '12px'
    }),
    upcomingEventContent: { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', flex: 1 },
    upcomingEventInfo: { flex: 1 },
    upcomingEventTitle: (typeStyle) => ({ fontWeight: 'bold', marginBottom: '4px', color: typeStyle.text }),
    upcomingEventDate: (typeStyle) => ({ fontSize: '12px', color: typeStyle.text, display: 'flex', alignItems: 'center', gap: '4px' }),
    upcomingEventLieu: (typeStyle) => ({ fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: typeStyle.text }),
    deleteEventBtn: {
      background: '#ef4444',
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
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' },
    legendColor: { width: '12px', height: '12px', borderRadius: '3px' },
    emptyState: { textAlign: 'center', padding: '40px', color: darkMode ? '#94a3b8' : '#64748b' }
  };

  // Composant d'option avec icône (fonctionne pour les navigateurs modernes)
  const OptionWithIcon = ({ value, icon, label }) => (
    <option value={value}>
      {label}
    </option>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <FontAwesomeIcon icon={faCalendarAlt} size="lg" color="#9333ea" />
          Calendrier des événements
        </h3>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            <FontAwesomeIcon icon={faPlus} /> Ajouter
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div style={styles.formContainer}>
          <div style={styles.formTitle}>
            <FontAwesomeIcon icon={faCalendarPlus} color="#9333ea" /> Nouvel événement
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <input 
                type="text" 
                placeholder="Titre *" 
                value={formData.titre} 
                onChange={e => setFormData({...formData, titre: e.target.value})} 
                required 
                style={styles.input} 
              />
              
              {/* Select avec style personnalisé - Les icônes sont affichées via CSS avant le select */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  style={styles.select}
                >
                  <option value="formation">
                     Formation
                  </option>
                  <option value="atelier">
                     Atelier
                  </option>
                  <option value="webinaire">
                     Webinaire
                  </option>
                  <option value="reunion">
                     Réunion
                  </option>
                  <option value="soutenance">
                     Soutenance
                  </option>
                </select>
              </div>
              
              <input 
                type="datetime-local" 
                value={formData.dateDebut} 
                onChange={e => setFormData({...formData, dateDebut: e.target.value})} 
                required 
                style={styles.input} 
              />
              
              <input 
                type="datetime-local" 
                value={formData.dateFin} 
                onChange={e => setFormData({...formData, dateFin: e.target.value})} 
                required 
                style={styles.input} 
              />
              
              <input 
                type="text" 
                placeholder="Lieu" 
                value={formData.lieu} 
                onChange={e => setFormData({...formData, lieu: e.target.value})} 
                style={styles.input} 
              />
            </div>
            
            <textarea 
              placeholder="Description" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              style={styles.textarea} 
              rows="2" 
            />
            
            <div style={styles.formButtons}>
              <button type="submit" disabled={loading} style={styles.createBtn}>
                {loading ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> Création...</>
                ) : (
                  <><FontAwesomeIcon icon={faCheck} /> Créer</>
                )}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.calendarNav}>
        <div style={styles.navButtons}>
          <button onClick={prevMonth} style={styles.navBtn}>
            <FontAwesomeIcon icon={faAngleLeft} /> Mois
          </button>
          <button onClick={goToToday} style={styles.todayBtn}>
            <FontAwesomeIcon icon={faCalendarDay} /> Aujourd'hui
          </button>
          <button onClick={nextMonth} style={styles.navBtn}>
            Mois <FontAwesomeIcon icon={faAngleRight} />
          </button>
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
                          <FontAwesomeIcon icon={typeStyle.icon} size="xs" />
                          {event.titre}
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
        <div style={styles.upcomingTitle}>
          <FontAwesomeIcon icon={faCalendarAlt} color="#9333ea" /> Événements à venir
        </div>
        {upcomingEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <FontAwesomeIcon icon={faBellSlash} size="2x" />
            <p>Aucun événement à venir</p>
          </div>
        ) : (
          upcomingEvents.map(event => {
            const typeStyle = getTypeStyle(event.type);
            return (
              <div key={event._id} style={styles.upcomingEvent(typeStyle)}>
                <div style={styles.upcomingEventContent}>
                  <FontAwesomeIcon icon={typeStyle.icon} size="lg" color={typeStyle.text} />
                  <div style={styles.upcomingEventInfo}>
                    <div style={styles.upcomingEventTitle(typeStyle)}>{event.titre}</div>
                    <div style={styles.upcomingEventDate(typeStyle)}>
                      <FontAwesomeIcon icon={faCalendar} size="xs" />
                      Du {new Date(event.dateDebut).toLocaleDateString('fr-FR')} au {new Date(event.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                    {event.lieu && (
                      <div style={styles.upcomingEventLieu(typeStyle)}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" /> {event.lieu}
                      </div>
                    )}
                    {event.description && (
                      <div style={{ fontSize: '11px', marginTop: '5px', color: typeStyle.text }}>
                        <FontAwesomeIcon icon={faInfoCircle} size="xs" /> {event.description}
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(event._id)} style={styles.deleteEventBtn}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Supprimer
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
              <FontAwesomeIcon icon={typeStyle.icon} size="xs" />
              <span>{getTypeLabel(type)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendrier;