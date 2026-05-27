import express from 'express';
import { auth, isAdmin } from '../middlewares/authentification.js';
import Notification from '../models/Notification.js';
import Utilisateur from '../models/Utilisateur.js';

const router = express.Router();

// Mes notifications (porteur + admin)
router.get('/mes-notifications', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ utilisateurId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifs);
  } catch (error) {
    console.error('Erreur chargement notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// server/routes/notifications.js - Vérifier ces routes

// Marquer une notification comme lue
router.put('/:id/lire', auth, async (req, res) => {
  console.log('📥 PUT /notifications/:id/lire appelé');
  console.log('📝 ID:', req.params.id);
  console.log('👤 Utilisateur:', req.user.id);
  
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateurId: req.user.id },
      { estLue: true },
      { new: true }
    );
    
    if (!notification) {
      console.log('❌ Notification non trouvée');
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    console.log('✅ Notification marquée comme lue');
    res.json(notification);
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Marquer toutes les notifications comme lues
router.put('/marquer-tout-lu', auth, async (req, res) => {
  console.log('📥 PUT /notifications/marquer-tout-lu appelé');
  console.log('👤 Utilisateur:', req.user.id);
  
  try {
    const result = await Notification.updateMany(
      { utilisateurId: req.user.id, estLue: false },
      { estLue: true }
    );
    
    console.log(`✅ ${result.modifiedCount} notification(s) marquée(s) comme lue(s)`);
    res.json({ 
      message: 'Toutes les notifications ont été marquées comme lues',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});
// ==================== ROUTE AJOUTÉE ====================
// Envoyer des recommandations de formations au porteur (admin)
router.post('/envoyer-recommandations', auth, isAdmin, async (req, res) => {
  console.log('📥 /envoyer-recommandations appelé');
  
  try {
    const { porteurId, formations, evenements } = req.body;
    
    if (!porteurId) {
      return res.status(400).json({ message: 'Porteur non spécifié' });
    }
    
    const porteur = await Utilisateur.findById(porteurId);
    if (!porteur) {
      return res.status(404).json({ message: 'Porteur non trouvé' });
    }
    
    let message = `📚 **Nouvelles recommandations disponibles**\n\n`;
    
    if (formations && formations.length > 0) {
      message += `**Formations recommandées :**\n`;
      formations.forEach(f => message += `• ${f}\n`);
      message += `\n`;
    }
    
    if (evenements && evenements.length > 0) {
      message += `**Événements recommandés :**\n`;
      evenements.forEach(e => {
        if (typeof e === 'object') {
          message += `• ${e.titre} - ${new Date(e.dateDebut).toLocaleDateString('fr-FR')}\n`;
        } else {
          message += `• ${e}\n`;
        }
      });
    }
    
    await Notification.create({
      utilisateurId: porteurId,
      titre: '📚 Nouvelles recommandations disponibles',
      message: message,
      type: 'info',
      estLue: false,
      lien: '/#analyses'
    });
    
    console.log(`✅ Recommandations envoyées à ${porteur.email}`);
    
    res.json({ 
      success: true, 
      message: `${formations?.length || 0} formation(s) et ${evenements?.length || 0} événement(s) recommandés au porteur` 
    });
  } catch (error) {
    console.error('❌ Erreur envoi recommandations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Envoyer un rapport d'analyse à l'admin
router.post('/send-report', auth, async (req, res) => {
  console.log('📥 /send-report appelé');
  
  try {
    const { projetId, resultat, fichierBMC } = req.body;
    console.log('📊 Score reçu:', resultat?.scoreImpact);
    
    const porteur = await Utilisateur.findById(req.user.id);
    if (!porteur) {
      return res.status(404).json({ message: 'Porteur non trouvé' });
    }
    
    const admins = await Utilisateur.find({ role: 'admin' });
    console.log(`👨‍💼 ${admins.length} admin(s) trouvé(s)`);
    
    for (const admin of admins) {
      await Notification.create({
        utilisateurId: admin._id,
        titre: "📊 Nouveau rapport d'analyse IA",
        message: `${porteur.firstName} ${porteur.lastName} a soumis un BMC. Score: ${resultat.scoreImpact}/100`,
        type: 'info',
        estLue: false,
        lien: '/admin#analyses',
        data: {
          porteurId: porteur._id,
          porteurNom: `${porteur.firstName} ${porteur.lastName}`,
          porteurEmail: porteur.email,
          scoreImpact: resultat.scoreImpact,
          niveauImpact: resultat.niveauImpact,
          secteur: resultat.secteur,
          formations: resultat.formations,
          feedback: resultat.feedback,
          fichierBMC: fichierBMC,
          dateAnalyse: new Date()
        }
      });
      console.log(`✅ Notification créée pour ${admin.email}`);
    }
    
    res.json({ success: true, message: 'Rapport envoyé' });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les rapports d'analyse (admin seulement)
router.get('/analyses', auth, isAdmin, async (req, res) => {
  try {
    const analyses = await Notification.find({ 
      'data.scoreImpact': { $exists: true } 
    }).sort({ createdAt: -1 }).populate('utilisateurId', 'firstName lastName email');
    
    res.json(analyses);
  } catch (error) {
    console.error('Erreur récupération analyses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un feedback admin à une analyse
router.post('/analyses/:id/feedback', auth, isAdmin, async (req, res) => {
  try {
    const { feedback, porteurId } = req.body;
    
    await Notification.findByIdAndUpdate(
      req.params.id,
      { feedbackAdmin: feedback },
      { new: true }
    );
    
    await Notification.create({
      utilisateurId: porteurId,
      titre: "📋 Nouveau feedback sur votre analyse IA",
      message: `L'administrateur a ajouté un feedback à votre analyse d'impact.`,
      type: 'info',
      estLue: false,
      lien: '/#analyse'
    });
    
    res.json({ success: true, message: 'Feedback envoyé' });
  } catch (error) {
    console.error('Erreur ajout feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
