import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes, faSpinner, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

function NotificationPopup() {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications/mes-notifications');
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.estLue).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLue = async (id) => {
    if (markingId === id) return;
    
    setMarkingId(id);
    try {
      const response = await api.put(`/notifications/${id}/lire`);
      if (response.data) {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, estLue: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('Toutes les notifications marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur marquage:', error);
    } finally {
      setMarkingId(null);
    }
  };

  const marquerToutCommeLu = async () => {
    if (markingAll || unreadCount === 0) return;
    
    setMarkingAll(true);
    try {
      const response = await api.put('/notifications/marquer-tout-lu');
      if (response.data) {
        setNotifications(prev => prev.map(n => ({ ...n, estLue: true })));
        setUnreadCount(0);
        console.log('Toutes les notifications marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur marquage tout:', error);
      alert('Erreur lors du marquage des notifications');
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type, message) => {
    if (type === 'succes' || message?.includes('validée') || message?.includes('terminée')) return '✅';
    if (type === 'warning' || message?.includes('commenté') || message?.includes('feedback')) return '💬';
    if (type === 'erreur') return '❌';
    return '🔔';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const styles = {
    container: {
      position: 'relative'
    },
    bellButton: {
      position: 'relative',
      background: darkMode ? '#334155' : '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      color: unreadCount > 0 ? '#f59e0b' : (darkMode ? '#94a3b8' : '#64748b')
    },
    badge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      minWidth: '18px',
      height: '18px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      padding: '0 4px',
      boxShadow: `0 0 0 2px ${darkMode ? '#1e293b' : 'white'}`
    },
    popup: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '380px',
      maxWidth: 'calc(100vw - 20px)',
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      zIndex: 1000,
      overflow: 'hidden',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    },
    header: {
      padding: '16px 20px',
      background: darkMode ? '#0f172a' : '#f8fafc',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontWeight: 'bold',
      fontSize: '16px',
      color: darkMode ? '#ffffff' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    markAllButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      padding: '6px 12px',
      borderRadius: '8px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    markAllDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    list: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    notificationItem: (estLue) => ({
      padding: '14px 16px',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      background: estLue ? 'transparent' : (darkMode ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)'),
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }),
    notificationIcon: {
      fontSize: '18px',
      minWidth: '28px'
    },
    notificationContent: {
      flex: 1
    },
    notificationMessage: {
      fontSize: '13px',
      color: darkMode ? '#e2e8f0' : '#334155',
      lineHeight: '1.4',
      marginBottom: '6px',
      wordBreak: 'break-word'
    },
    notificationDate: {
      fontSize: '10px',
      color: darkMode ? '#64748b' : '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    unreadDot: {
      width: '8px',
      height: '8px',
      background: '#f59e0b',
      borderRadius: '50%',
      marginTop: '4px',
      flexShrink: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: darkMode ? '#94a3b8' : '#64748b'
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px',
      color: darkMode ? '#94a3b8' : '#64748b'
    }
  };

  return (
    <div style={styles.container} ref={popupRef}>
      <button 
        className="btn-shine" 
        style={styles.bellButton} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.popup}>
          <div style={styles.header}>
            <div style={styles.title}>
              <FontAwesomeIcon icon={faBell} />
              Notifications
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', color: '#f59e0b', marginLeft: '4px' }}>
                  ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={marquerToutCommeLu}
                disabled={markingAll}
                style={{
                  ...styles.markAllButton,
                  ...(markingAll ? styles.markAllDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!markingAll) e.currentTarget.style.background = darkMode ? '#334155' : '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                {markingAll ? (
                  <><FontAwesomeIcon icon={faSpinner} spin /> Chargement...</>
                ) : (
                  <><FontAwesomeIcon icon={faCheckDouble} /> Tout marquer comme lu</>
                )}
              </button>
            )}
          </div>

          <div style={styles.list}>
            {loading ? (
              <div style={styles.loadingState}>
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p style={{ marginTop: '12px' }}>Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <FontAwesomeIcon icon={faBell} size="2x" style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>Aucune notification</p>
                <p style={{ fontSize: '11px', marginTop: '8px' }}>Vous serez notifié des mises à jour importantes</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  style={styles.notificationItem(notif.estLue)}
                  onClick={() => !notif.estLue && marquerCommeLue(notif._id)}
                >
                  <div style={styles.notificationIcon}>
                    {getNotificationIcon(notif.type, notif.message)}
                  </div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationMessage}>{notif.message}</div>
                    <div style={styles.notificationDate}>
                      <FontAwesomeIcon icon={faBell} size="xs" style={{ opacity: 0.5 }} />
                      {formatDate(notif.createdAt)}
                    </div>
                  </div>
                  {!notif.estLue && (
                    <>
                      <div style={styles.unreadDot} />
                      {markingId === notif._id && (
                        <FontAwesomeIcon icon={faSpinner} spin size="sm" style={{ marginLeft: '8px' }} />
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPopup;