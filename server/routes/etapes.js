import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, isAdmin } from '../middlewares/authentification.js';
import Etape from '../models/Etape.js';
import Notification from '../models/Notification.js';
import Utilisateur from '../models/Utilisateur.js';
import { etapesEarlyStage } from '../data/etapesPredefinies.js';

const router = express.Router();

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './telechargements';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'document-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ========== ROUTES ADMIN ==========

// Assigner les étapes Early-Stage (admin)
router.post('/assigner-early-stage', auth, isAdmin, async (req, res) => {
  try {
    const { porteurId, projetId } = req.body;
    
    if (!porteurId || !projetId) {
      return res.status(400).json({ message: 'Porteur et projet requis' });
    }
    
    // Supprimer les anciennes étapes
    await Etape.deleteMany({ porteurId: porteurId, type: 'early-stage' });
    
    // Créer les nouvelles étapes selon la liste prédéfinie
    for (const etape of etapesEarlyStage) {
      await Etape.create({
        porteurId: porteurId,
        projetId: projetId,
        numero: etape.numero,
        titre: etape.titre,
        description: etape.description,
        mois: etape.mois,
        documentRequis: etape.documentRequis,
        type: 'early-stage',
        statut: 'en_attente'
      });
    }
    
    await Notification.create({
      utilisateurId: porteurId,
      titre: 'Programme Early-Stage assigné',
      message: `Le programme Early-Stage (${etapesEarlyStage.length} étapes) vous a été assigné.`,
      type: 'info',
      estLue: false,
      lien: '/'
    });
    
    res.json({ success: true, message: `${etapesEarlyStage.length} étapes assignées` });
  } catch (error) {
    console.error('Erreur assignation:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/etapes/soumissions - Soumissions en attente (admin)
router.get('/soumissions', auth, isAdmin, async (req, res) => {
  try {
    const soumissions = await Etape.find({ statut: 'soumise' })
      .populate('porteurId', 'firstName lastName email');
    res.json(soumissions);
  } catch (error) {
    console.error('Erreur chargement soumissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/etapes/valider/:id - Valider une étape (admin)
router.put('/valider/:id', auth, isAdmin, async (req, res) => {
  try {
    const { commentaire } = req.body;
    
    const etape = await Etape.findByIdAndUpdate(
      req.params.id,
      { 
        statut: 'validee', 
        commentaireAdmin: commentaire, 
        dateValidation: new Date() 
      },
      { new: true }
    );
    
    if (!etape) {
      return res.status(404).json({ message: 'Étape non trouvée' });
    }
    
    await Notification.create({
      utilisateurId: etape.porteurId,
      titre: 'Étape validée',
      message: `Votre étape "${etape.titre}" a été validée.${commentaire ? ` Feedback: ${commentaire}` : ''}`,
      type: 'succes',
      estLue: false,
      lien: '/'
    });
    
    res.json({ success: true, message: 'Étape validée avec succès', etape });
  } catch (error) {
    console.error('Erreur validation:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/etapes/refuser/:id - Refuser une étape (admin)
router.put('/refuser/:id', auth, isAdmin, async (req, res) => {
  try {
    const { commentaire } = req.body;
    
    if (!commentaire) {
      return res.status(400).json({ message: 'Un commentaire est requis pour le refus' });
    }
    
    const etape = await Etape.findByIdAndUpdate(
      req.params.id,
      { 
        statut: 'refusee', 
        commentaireAdmin: commentaire, 
        dateValidation: new Date() 
      },
      { new: true }
    );
    
    if (!etape) {
      return res.status(404).json({ message: 'Étape non trouvée' });
    }
    
    await Notification.create({
      utilisateurId: etape.porteurId,
      titre: 'Document à reprendre',
      message: `Votre document "${etape.titre}" nécessite des modifications. Feedback: ${commentaire}`,
      type: 'warning',
      estLue: false,
      lien: '/'
    });
    
    res.json({ success: true, message: 'Étape refusée', etape });
  } catch (error) {
    console.error('Erreur refus:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== ROUTES PORTEUR ==========

// POST /api/etapes/soumettre - Soumettre une étape
router.post('/soumettre', auth, upload.single('fichier'), async (req, res) => {
  console.log('Route /soumettre atteinte');
  
  try {
    const { etapeId, commentaire } = req.body;
    const fichier = req.file;
    
    if (!etapeId) {
      return res.status(400).json({ success: false, message: 'ID étape manquant' });
    }
    
    if (!fichier) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    
    // Mettre à jour l'étape
    const etape = await Etape.findByIdAndUpdate(
      etapeId,
      {
        documentUrl: fichier.path,
        documentNom: fichier.originalname,
        commentairePorteur: commentaire || '',
        statut: 'soumise',
        dateSoumission: new Date()
      },
      { new: true }
    );
    
    if (!etape) {
      return res.status(404).json({ success: false, message: 'Étape non trouvée' });
    }
    
    console.log(`Étape "${etape.titre}" soumise par ${req.user.email}`);
    
    // Notifier les admins
    const admins = await Utilisateur.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        utilisateurId: admin._id,
        titre: 'Nouvelle soumission',
        message: `${req.user.firstName} ${req.user.lastName} a soumis l'étape "${etape.titre}"`,
        type: 'info',
        estLue: false,
        lien: '/admin#soumissions'
      });
    }
    
    res.json({ success: true, message: 'Étape soumise avec succès', etape });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/etapes/soumettre-bmc - Soumettre un BMC
router.post('/soumettre-bmc', auth, upload.single('fichier'), async (req, res) => {
  console.log('Route /soumettre-bmc atteinte');
  
  try {
    const { etapeId, commentaire } = req.body;
    const fichier = req.file;
    
    if (!fichier) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    
    if (fichier.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Le BMC doit être au format PDF' });
    }
    
    const etape = await Etape.findByIdAndUpdate(
      etapeId,
      {
        documentUrl: fichier.path,
        documentNom: fichier.originalname,
        commentairePorteur: commentaire || '',
        statut: 'soumise',
        dateSoumission: new Date()
      },
      { new: true }
    );
    
    if (!etape) {
      return res.status(404).json({ success: false, message: 'Étape non trouvée' });
    }
    
    let analyseResult = null;
    
    try {
      const { analyserBMCPDF } = await import('../services/aiService.js');
      const AIAnalysis = (await import('../models/AIAnalysis.js')).default;
      
      const analyse = await analyserBMCPDF(fichier.path);
      
      if (!analyse.erreur) {
        const nouvelleAnalyse = await AIAnalysis.create({
          porteurId: req.user.id,
          projetId: etape.projetId,
          fichierBMC: fichier.originalname,
          cheminFichier: fichier.path,
          scoreImpact: analyse.scoreImpact,
          niveauImpact: analyse.niveauImpact,
          secteur: analyse.secteur,
          recommandations: analyse.recommandations || [],
          formations: analyse.formations || [],
          evenements: analyse.evenements || [],
          feedback: analyse.feedback,
          dateAnalyse: new Date()
        });
        
        analyseResult = {
          analyseId: nouvelleAnalyse._id,
          scoreImpact: analyse.scoreImpact,
          niveauImpact: analyse.niveauImpact,
          feedback: analyse.feedback,
          recommandations: analyse.recommandations || []
        };
        
        await Notification.create({
          utilisateurId: req.user.id,
          titre: 'Analyse BMC terminée',
          message: `Votre BMC a été analysé. Score: ${analyse.scoreImpact}/100.`,
          type: 'succes',
          estLue: false,
          lien: '/#analyses'
        });
      }
    } catch (iaError) {
      console.error('Erreur analyse IA:', iaError);
    }
    
    const admins = await Utilisateur.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        utilisateurId: admin._id,
        titre: 'Nouvelle analyse BMC',
        message: `${req.user.firstName} ${req.user.lastName} a soumis son BMC. Score: ${analyseResult?.scoreImpact || 'En attente'}/100`,
        type: 'info',
        estLue: false,
        lien: '/admin#analyses'
      });
    }
    
    res.json({ success: true, analyseIA: analyseResult });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mes étapes
router.get('/mes-etapes', auth, async (req, res) => {
  try {
    const etapes = await Etape.find({ porteurId: req.user.id }).sort({ numero: 1 });
    res.json(etapes);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mes soumissions
router.get('/mes-soumissions', auth, async (req, res) => {
  try {
    const soumissions = await Etape.find({ 
      porteurId: req.user.id,
      statut: { $in: ['soumise', 'validee', 'refusee'] }
    }).sort({ dateSoumission: -1 });
    res.json(soumissions);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Détail d'une étape
router.get('/:id', auth, async (req, res) => {
  try {
    const etape = await Etape.findById(req.params.id);
    if (!etape) {
      return res.status(404).json({ message: 'Étape non trouvée' });
    }
    res.json(etape);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;