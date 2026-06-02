// server/routes/ai.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, isAdmin } from '../middlewares/authentification.js';
import AIAnalysis from '../models/AIAnalysis.js';
import Notification from '../models/Notification.js';
import Utilisateur from '../models/Utilisateur.js';
import { analyserBMCPDF, recommanderMentors } from '../services/aiService.js';

const router = express.Router();

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './telechargements/ia';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Dossier créé:', dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'bmc-' + uniqueSuffix + '.pdf';
    console.log('Fichier généré:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  }
});

// ==================== ROUTES PORTEUR ====================

// POST /api/ai/analyser-bmc - Analyser un BMC
router.post('/analyser-bmc', auth, upload.single('bmc'), async (req, res) => {
  console.log('Route /analyser-bmc atteinte');
  console.log('Porteur ID:', req.user.id);
  console.log('Fichier reçu:', req.file?.originalname);
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    
    // Analyser le BMC
    console.log('Lancement de l\'analyse IA...');
    const analyse = await analyserBMCPDF(req.file.path);
    
    if (analyse.erreur) {
      console.log('⚠️ Erreur analyse:', analyse.erreur);
      return res.status(400).json({ success: false, message: analyse.erreur });
    }
    
    console.log('Score obtenu:', analyse.scoreImpact);
    
    // Sauvegarder l'analyse
    const nouvelleAnalyse = new AIAnalysis({
      porteurId: req.user.id,
      fichierBMC: req.file.originalname,
      cheminFichier: req.file.path,
      scoreImpact: analyse.scoreImpact,
      niveauImpact: analyse.niveauImpact,
      secteur: analyse.secteur,
      recommandations: analyse.recommandations || [],
      formations: analyse.formations || [],
      feedback: analyse.feedback,
      dateAnalyse: new Date()
    });
    
    await nouvelleAnalyse.save();
    console.log('Analyse sauvegardée avec ID:', nouvelleAnalyse._id);
    
    // RECOMMANDER LES MEILLEURS MENTORS 
    let mentorsRecommandes = [];
    try {
      mentorsRecommandes = await recommanderMentors(analyse, req.user.id);
      console.log(` ${mentorsRecommandes.length} mentor(s) recommandé(s)`);
      if (mentorsRecommandes.length > 0) {
        console.log(`Top mentor: ${mentorsRecommandes[0].firstName} ${mentorsRecommandes[0].lastName} - Score: ${mentorsRecommandes[0].scoreCompatibilite}%`);
      }
    } catch (mentorError) {
      console.error('Erreur recommandation mentors:', mentorError);
    }
    
    // Notifier le porteur
    let messageNotification = `Votre analyse BMC est terminée. Score: ${analyse.scoreImpact}/100. ${analyse.recommandations?.length || 0} recommandations disponibles.`;
    if (mentorsRecommandes.length > 0) {
      messageNotification += `\n\n ${mentorsRecommandes.length} mentor(s) recommandé(s) pour vous accompagner !`;
    }
    
    await Notification.create({
      utilisateurId: req.user.id,
      titre: 'Analyse IA terminée',
      message: messageNotification,
      type: 'succes',
      estLue: false,
      lien: '/#analyses'
    });
    
    // Notifier les admins
    const admins = await Utilisateur.find({ role: 'admin' });
    console.log(`Notification de ${admins.length} admin(s)`);
    
    for (const admin of admins) {
      let adminMessage = `${req.user.firstName} ${req.user.lastName} a soumis une analyse BMC. Score: ${analyse.scoreImpact}/100.`;
      if (mentorsRecommandes.length > 0) {
        adminMessage += `\n\n Mentors recommandés: ${mentorsRecommandes.map(m => `${m.firstName} ${m.lastName} (${m.scoreCompatibilite}%)`).join(', ')}`;
      }
      
      await Notification.create({
        utilisateurId: admin._id,
        titre: 'Nouvelle analyse BMC',
        message: adminMessage,
        type: 'info',
        estLue: false,
        lien: '/admin#analyses'
      });
    }
    
    res.json({
      success: true,
      analyseId: nouvelleAnalyse._id,
      scoreImpact: analyse.scoreImpact,
      niveauImpact: analyse.niveauImpact,
      formations: analyse.formations,
      feedback: analyse.feedback,
      recommandations: analyse.recommandations,
      mentorsRecommandes: mentorsRecommandes
    });
    
  } catch (error) {
    console.error('Erreur analyse BMC:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/mes-analyses - Mes analyses (porteur)
router.get('/mes-analyses', auth, async (req, res) => {
  console.log('GET /mes-analyses appelé par porteur:', req.user.id);
  
  try {
    const analyses = await AIAnalysis.find({ porteurId: req.user.id })
      .sort({ dateAnalyse: -1 });
    
    console.log(` ${analyses.length} analyses trouvées`);
    res.json(analyses);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ai/analyse/:id - Détail d'une analyse (porteur ou admin)
router.get('/analyse/:id', auth, async (req, res) => {
  console.log('GET /analyse/:id appelé pour analyse:', req.params.id);
  
  try {
    const analyse = await AIAnalysis.findById(req.params.id)
      .populate('porteurId', 'firstName lastName email');
    
    if (!analyse) {
      return res.status(404).json({ message: 'Analyse non trouvée' });
    }
    
    // Vérifier les droits
    const isOwner = analyse.porteurId._id.toString() === req.user.id;
    const isAdminUser = req.user.role === 'admin';
    
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    res.json(analyse);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== ROUTES ADMIN ====================

// GET /api/ai/toutes-les-analyses - Toutes les analyses (admin)
router.get('/toutes-les-analyses', auth, isAdmin, async (req, res) => {
  console.log('GET /toutes-les-analyses appelé par admin:', req.user.email);
  
  try {
    const analyses = await AIAnalysis.find({})
      .sort({ dateAnalyse: -1 })
      .populate('porteurId', 'firstName lastName email');
    
    console.log(`${analyses.length} analyses trouvées`);
    res.json(analyses);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ai/analyses-porteur/:porteurId - Analyses d'un porteur spécifique (admin)
router.get('/analyses-porteur/:porteurId', auth, isAdmin, async (req, res) => {
  console.log('GET /analyses-porteur appelé pour porteur:', req.params.porteurId);
  
  try {
    const analyses = await AIAnalysis.find({ porteurId: req.params.porteurId })
      .sort({ dateAnalyse: -1 })
      .populate('porteurId', 'firstName lastName email');
    
    console.log(`${analyses.length} analyses trouvées pour ce porteur`);
    res.json(analyses);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/analyse/:id/feedback - Ajouter un feedback admin
router.post('/analyse/:id/feedback', auth, isAdmin, async (req, res) => {
  console.log('POST /analyse/:id/feedback appelé pour analyse:', req.params.id);
  
  try {
    const { feedback } = req.body;
    
    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ message: 'Le feedback ne peut pas être vide' });
    }
    
    const analyse = await AIAnalysis.findById(req.params.id).populate('porteurId', 'firstName lastName email');
    
    if (!analyse) {
      return res.status(404).json({ message: 'Analyse non trouvée' });
    }
    
    analyse.feedbackAdmin = feedback;
    analyse.dateFeedback = new Date();
    await analyse.save();
    
    console.log('Feedback ajouté pour analyse:', analyse._id);
    
    // Notifier le porteur
    await Notification.create({
      utilisateurId: analyse.porteurId._id,
      titre: 'Feedback sur votre analyse BMC',
      message: `Un administrateur a commenté votre analyse BMC. Score: ${analyse.scoreImpact}/100. Feedback: "${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}"`,
      type: 'info',
      estLue: false,
      lien: '/#analyses'
    });
    
    res.json({ 
      success: true, 
      message: 'Feedback envoyé au porteur',
      feedback: feedback
    });
  } catch (error) {
    console.error('Erreur envoi feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/ai/analyse/:id - Supprimer une analyse (admin ou propriétaire)
router.delete('/analyse/:id', auth, async (req, res) => {
  console.log('DELETE /analyse/:id appelé pour analyse:', req.params.id);
  
  try {
    const analyse = await AIAnalysis.findById(req.params.id);
    
    if (!analyse) {
      return res.status(404).json({ success: false, message: 'Analyse non trouvée' });
    }
    
    const isAdminUser = req.user.role === 'admin';
    const isOwner = analyse.porteurId.toString() === req.user.id;
    
    if (!isAdminUser && !isOwner) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    
    // Supprimer le fichier associé
    if (analyse.cheminFichier && fs.existsSync(analyse.cheminFichier)) {
      try {
        fs.unlinkSync(analyse.cheminFichier);
        console.log('Fichier supprimé:', analyse.cheminFichier);
      } catch (fileError) {
        console.log('Fichier non trouvé:', fileError.message);
      }
    }
    
    await AIAnalysis.findByIdAndDelete(req.params.id);
    console.log('Analyse supprimée');
    
    res.json({ success: true, message: 'Analyse supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression analyse:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ROUTES POUR LES MENTORS ====================

// GET /api/ai/mentors-pour-porteur/:porteurId - Recommandations mentors pour un porteur (admin)
router.get('/mentors-pour-porteur/:porteurId', auth, isAdmin, async (req, res) => {
  console.log('GET /mentors-pour-porteur appelé pour porteur:', req.params.porteurId);
  
  try {
    // Récupérer la dernière analyse du porteur
    const derniereAnalyse = await AIAnalysis.findOne({ porteurId: req.params.porteurId })
      .sort({ dateAnalyse: -1 });
    
    if (!derniereAnalyse) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucune analyse trouvée pour ce porteur' 
      });
    }
    
    const mentors = await recommanderMentors(derniereAnalyse, req.params.porteurId);
    
    res.json({
      success: true,
      mentors: mentors
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== ROUTE DE TEST ====================

// GET /api/ai/test - Route de test
router.get('/test', auth, async (req, res) => {
  console.log('GET /test appelé par:', req.user.email);
  res.json({ 
    success: true, 
    message: 'Service AI fonctionnel',
    user: { id: req.user.id, role: req.user.role }
  });
});

export default router;