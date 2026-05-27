import express from 'express';
import { auth } from '../middlewares/authentification.js';
import { trouverMeilleursMentorsBMC } from '../services/matchingBMCService.js';
import MatchingProposal from '../models/MatchingProposal.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/**
 * GET /api/matching/recommandations
 * Obtenir les recommandations de mentors pour le porteur (focus BMC)
 */
router.get('/recommandations', auth, async (req, res) => {
  try {
    const resultat = await trouverMeilleursMentorsBMC(req.user.id, 3);
    
    if (!resultat.success) {
      return res.status(400).json(resultat);
    }
    
    res.json({
      success: true,
      resumeBesoins: resultat.resumeBesoins,
      propositions: resultat.propositions
    });
  } catch (error) {
    console.error('Erreur recommandations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/matching/accepter/:proposalId
 * Accepter une proposition de matching (porteur)
 */
router.post('/accepter/:proposalId', auth, async (req, res) => {
  try {
    const proposal = await MatchingProposal.findById(req.params.proposalId);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposition non trouvée' });
    }
    
    if (proposal.porteurId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    
    proposal.statut = 'accepte_par_porteur';
    proposal.dateAcceptation = new Date();
    await proposal.save();
    
    // Notifier le mentor
    await Notification.create({
      utilisateurId: proposal.mentorId,
      titre: '🎯 Nouvelle demande de mentoring',
      message: `Un porteur a accepté votre proposition de mentoring. Connectez-vous pour plus de détails.`,
      type: 'info',
      estLue: false,
      lien: '/mentor/dashboard'
    });
    
    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Erreur acceptation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/matching/mes-propositions
 * Voir les propositions pour le porteur connecté
 */
router.get('/mes-propositions', auth, async (req, res) => {
  try {
    const proposals = await MatchingProposal.find({ 
      porteurId: req.user.id,
      statut: { $in: ['propose', 'accepte_par_porteur'] }
    }).populate('mentorId', 'firstName lastName email avatar expertiseBMC.niveauGlobal');
    
    res.json(proposals);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;