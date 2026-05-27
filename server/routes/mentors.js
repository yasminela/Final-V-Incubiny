import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, isAdmin } from '../middlewares/authentification.js';
import Mentor from '../models/Mentor.js';

const router = express.Router();

console.log('✅ Route mentors chargée');

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './telechargements/cv_mentors';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-mentor-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  }
});

// ==================== ROUTES ====================

// GET /api/mentors - Liste des mentors
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const mentors = await Mentor.find({}).sort({ dateCreation: -1 });
    res.json(mentors);
  } catch (error) {
    console.error('Erreur GET mentors:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/mentors/public - Liste publique (sans auth pour le porteur)
router.get('/public', async (req, res) => {
  try {
    const mentors = await Mentor.find({ estDisponible: true, estVerifie: true })
      .select('firstName lastName email bio expertiseBMC.niveauGlobal disponibilite')
      .sort({ 'expertiseBMC.niveauGlobal': -1 });
    res.json(mentors);
  } catch (error) {
    console.error('Erreur GET mentors public:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/mentors/:id - Détail d'un mentor
router.get('/:id', auth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor non trouvé' });
    }
    res.json(mentor);
  } catch (error) {
    console.error('Erreur GET mentor:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/mentors/scan-cv - Scanner un CV
router.post('/scan-cv', auth, isAdmin, upload.single('cv'), async (req, res) => {
  console.log('📥 POST /scan-cv appelé');
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    
    console.log('✅ Fichier reçu:', req.file.originalname);
    
    const mentor = new Mentor({
      firstName: 'Nouveau',
      lastName: 'Mentor',
      email: `mentor-${Date.now()}@temp.com`,
      cvUrl: req.file.path,
      source: 'scan_pdf',
      expertiseBMC: {
        niveauGlobal: 3,
        blocsExpertise: {
          propositionValeur: { niveau: 3, anneesExperience: 0 },
          segmentsClients: { niveau: 2, anneesExperience: 0 },
          canaux: { niveau: 2, anneesExperience: 0 },
          relationsClients: { niveau: 2, anneesExperience: 0 },
          fluxRevenus: { niveau: 2, anneesExperience: 0 },
          ressourcesCles: { niveau: 2, anneesExperience: 0 },
          activitesCles: { niveau: 2, anneesExperience: 0 },
          partenariatsCles: { niveau: 2, anneesExperience: 0 },
          structureCouts: { niveau: 2, anneesExperience: 0 }
        }
      }
    });
    
    await mentor.save();
    console.log('💾 Mentor créé avec ID:', mentor._id);
    
    res.json({ success: true, message: 'CV analysé avec succès', mentor });
  } catch (error) {
    console.error('❌ Erreur scan CV:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/mentors - Créer un mentor manuellement
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json({ success: true, mentor });
  } catch (error) {
    console.error('Erreur création mentor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/mentors/:id - Modifier un mentor
router.put('/:id', auth, isAdmin, async (req, res) => {
  console.log('📥 PUT /mentors/:id appelé');
  
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, dateModification: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor non trouvé' });
    }
    
    console.log('✅ Mentor modifié:', mentor._id);
    res.json({ success: true, message: 'Mentor modifié', mentor });
  } catch (error) {
    console.error('❌ Erreur modification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/mentors/:id - Supprimer un mentor
router.delete('/:id', auth, isAdmin, async (req, res) => {
  console.log('📥 DELETE /mentors/:id appelé');
  
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor non trouvé' });
    }
    console.log('✅ Mentor supprimé:', mentor._id);
    res.json({ success: true, message: 'Mentor supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/mentors/:id/verifier - Vérifier un mentor
router.post('/:id/verifier', auth, isAdmin, async (req, res) => {
  console.log('📥 POST /mentors/:id/verifier appelé');
  console.log('📝 ID:', req.params.id);
  
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { estVerifie: true, dateModification: new Date() },
      { new: true }
    );
    
    if (!mentor) {
      console.log('❌ Mentor non trouvé:', req.params.id);
      return res.status(404).json({ success: false, message: 'Mentor non trouvé' });
    }
    
    console.log('✅ Mentor vérifié:', mentor._id);
    res.json({ success: true, message: 'Mentor vérifié avec succès', mentor });
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;