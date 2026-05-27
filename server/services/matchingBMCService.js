import Mentor from '../models/Mentor.js';
import MatchingProposal from '../models/MatchingProposal.js';
import AIAnalysis from '../models/AIAnalysis.js';

// POIDS DES CRITÈRES - FOCUS BMC
const POIDS_BMC = {
  propositionValeur: 35,      // Le plus important
  businessModel: 25,          // Cohérence globale du BMC
  innovation: 20,             // Originalité et différenciation
  finance: 8,
  strategie: 7,
  marketing: 5
};

// SEUILS DE COMPATIBILITÉ
const SEUILS = {
  EXCELLENT: 80,
  BON: 60,
  MINIMUM: 40
};

/**
 * Analyse les besoins du porteur à partir de son analyse IA (focus BMC)
 */
export const analyserBesoinsPorteurBMC = async (porteurId, analyseIA) => {
  const besoins = [];
  const recommandations = analyseIA.recommandations || [];
  const feedback = analyseIA.feedback || '';
  const score = analyseIA.scoreImpact || 0;
  
  // Détection des besoins par bloc BMC
  const mappingBesoins = {
    propositionValeur: {
      motsCles: ['proposition valeur', 'value proposition', 'vague', 'peu claire', 'différenciation', 'unique'],
      poids: 35,
      description: 'Proposition de valeur à améliorer'
    },
    businessModel: {
      motsCles: ['business model', 'modèle d\'affaires', 'bmc', 'cohérence', 'global'],
      poids: 25,
      description: 'Cohérence globale du BMC à renforcer'
    },
    innovation: {
      motsCles: ['innovation', 'créativité', 'original', 'différent', 'disruptif'],
      poids: 20,
      description: 'Innovation et différenciation à développer'
    },
    finance: {
      motsCles: ['finance', 'budget', 'prévision', 'trésorerie', 'revenu'],
      poids: 8,
      description: 'Modèle financier à structurer'
    },
    strategie: {
      motsCles: ['stratégie', 'vision', 'objectif', 'feuille route', 'croissance'],
      poids: 7,
      description: 'Stratégie à clarifier'
    },
    marketing: {
      motsCles: ['marketing', 'marché', 'acquisition', 'client', 'cible'],
      poids: 5,
      description: 'Stratégie marketing à définir'
    }
  };
  
  // Analyser les recommandations pour identifier les besoins
  for (const [domaine, config] of Object.entries(mappingBesoins)) {
    let scoreBesoin = 0;
    let motsTrouves = [];
    
    for (const mot of config.motsCles) {
      if (feedback.toLowerCase().includes(mot.toLowerCase()) ||
          recommandations.some(r => r.toLowerCase().includes(mot.toLowerCase()))) {
        scoreBesoin += 20;
        motsTrouves.push(mot);
      }
    }
    
    // Ajustement basé sur le score global
    let urgence = 'moyenne';
    if (score < 40 && domaine === 'propositionValeur') urgence = 'élevée';
    if (score > 70) urgence = 'faible';
    
    if (scoreBesoin > 0 || domaine === 'propositionValeur') { // Proposition valeur toujours prioritaire
      besoins.push({
        type: domaine,
        description: config.description,
        poids: config.poids,
        score: Math.min(100, scoreBesoin),
        urgence: urgence,
        motsClesIdentifies: motsTrouves
      });
    }
  }
  
  // Trier par urgence décroissante
  besoins.sort((a, b) => {
    const ordreUrgence = { élevée: 3, moyenne: 2, faible: 1 };
    return ordreUrgence[b.urgence] - ordreUrgence[a.urgence];
  });
  
  return besoins;
};

/**
 * Calcule le score de compatibilité entre un porteur et un mentor (focus BMC)
 */
export const calculerScoreCompatibiliteBMC = (besoinsPorteur, mentor) => {
  let scoreTotal = 0;
  const scoresParDomaine = {};
  const justifications = [];
  
  // 1. Score sur la proposition de valeur (35%)
  const scorePropositionValeur = (mentor.expertiseBMC.blocsExpertise.propositionValeur.niveau / 5) * 100;
  scoresParDomaine.propositionValeur = scorePropositionValeur;
  scoreTotal += scorePropositionValeur * 0.35;
  
  if (scorePropositionValeur >= 80) {
    justifications.push({
      besoin: 'Proposition de valeur',
      expertise: `Expert niveau ${mentor.expertiseBMC.blocsExpertise.propositionValeur.niveau}/5`,
      score: scorePropositionValeur
    });
  }
  
  // 2. Score global BMC (25%)
  const scoreGlobalBMC = (mentor.expertiseBMC.niveauGlobal / 5) * 100;
  scoresParDomaine.businessModel = scoreGlobalBMC;
  scoreTotal += scoreGlobalBMC * 0.25;
  
  if (scoreGlobalBMC >= 70) {
    justifications.push({
      besoin: 'Maîtrise globale du BMC',
      expertise: `Expertise BMC niveau ${mentor.expertiseBMC.niveauGlobal}/5`,
      score: scoreGlobalBMC
    });
  }
  
  // 3. Score sur l'innovation (20%)
  const aMethodologieVPD = mentor.expertiseBMC.methodologies.some(m => 
    m.nom === 'Value Proposition Design'
  );
  const scoreInnovation = aMethodologieVPD ? 100 : 60;
  scoresParDomaine.innovation = scoreInnovation;
  scoreTotal += scoreInnovation * 0.20;
  
  if (aMethodologieVPD) {
    justifications.push({
      besoin: 'Innovation / Différenciation',
      expertise: 'Maîtrise de la méthode Value Proposition Design',
      score: 100
    });
  }
  
  // 4. Score sur les besoins spécifiques détectés
  for (const besoin of besoinsPorteur) {
    let scoreDomaine = 0;
    let expertiseTrouvee = '';
    
    switch (besoin.type) {
      case 'finance':
        const financeExp = mentor.expertisesSecondaires.find(e => e.domaine === 'finance');
        scoreDomaine = financeExp ? (financeExp.niveau / 5) * 100 : 30;
        expertiseTrouvee = financeExp ? `Expertise finance niveau ${financeExp.niveau}/5` : 'Pas d\'expertise spécifique';
        break;
      case 'strategie':
        const strategieExp = mentor.expertisesSecondaires.find(e => e.domaine === 'strategie');
        scoreDomaine = strategieExp ? (strategieExp.niveau / 5) * 100 : 30;
        expertiseTrouvee = strategieExp ? `Expertise stratégie niveau ${strategieExp.niveau}/5` : 'Pas d\'expertise spécifique';
        break;
      case 'marketing':
        const marketingExp = mentor.expertisesSecondaires.find(e => e.domaine === 'marketing');
        scoreDomaine = marketingExp ? (marketingExp.niveau / 5) * 100 : 30;
        expertiseTrouvee = marketingExp ? `Expertise marketing niveau ${marketingExp.niveau}/5` : 'Pas d\'expertise spécifique';
        break;
      default:
        scoreDomaine = 50;
    }
    
    scoresParDomaine[besoin.type] = scoreDomaine;
    scoreTotal += scoreDomaine * (besoin.poids / 100);
  }
  
  // 5. Bonus pour expérience prouvée
  if (mentor.statistiquesBMC.ameliorationMoyenneScore > 15) {
    scoreTotal += 10;
    justifications.push({
      besoin: 'Historique prouvé',
      expertise: `${mentor.statistiquesBMC.nbPorteursAccompagnes} porteurs accompagnés, +${mentor.statistiquesBMC.ameliorationMoyenneScore} points en moyenne`,
      score: 100
    });
  }
  
  // 6. Bonus pour disponibilité
  if (mentor.disponibilite.heuresParSemaine >= 8) {
    scoreTotal += 5;
  }
  
  const scoreFinal = Math.min(100, Math.round(scoreTotal));
  
  return {
    scoreGlobal: scoreFinal,
    scoresParDomaine,
    justifications,
    niveau: scoreFinal >= SEUILS.EXCELLENT ? 'excellent' :
            scoreFinal >= SEUILS.BON ? 'bon' :
            scoreFinal >= SEUILS.MINIMUM ? 'moyen' : 'faible'
  };
};

/**
 * Trouve les meilleurs mentors pour un porteur (focus BMC)
 */
export const trouverMeilleursMentorsBMC = async (porteurId, limite = 3) => {
  try {
    // 1. Récupérer la dernière analyse IA du porteur
    const derniereAnalyse = await AIAnalysis.findOne({ porteurId })
      .sort({ dateAnalyse: -1 });
    
    if (!derniereAnalyse) {
      return { 
        success: false, 
        message: 'Aucune analyse IA disponible. Veuillez d\'abord soumettre votre BMC.' 
      };
    }
    
    // 2. Analyser les besoins du porteur (focus BMC)
    const besoins = await analyserBesoinsPorteurBMC(porteurId, derniereAnalyse);
    
    // 3. Récupérer tous les mentors disponibles et vérifiés
    const mentors = await Mentor.find({ 
      estDisponible: true, 
      estVerifie: true,
      'expertiseBMC.niveauGlobal': { $gte: 2 } // Au moins niveau 2 en BMC
    });
    
    if (mentors.length === 0) {
      return { success: false, message: 'Aucun mentor disponible pour le moment.' };
    }
    
    // 4. Calculer le score pour chaque mentor
    const matchs = [];
    for (const mentor of mentors) {
      const compatibilite = calculerScoreCompatibiliteBMC(besoins, mentor);
      
      // Ne garder que les mentors avec score minimum
      if (compatibilite.scoreGlobal >= SEUILS.MINIMUM) {
        matchs.push({
          mentorId: mentor._id,
          mentor: {
            id: mentor._id,
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            email: mentor.email,
            avatar: mentor.avatar,
            bio: mentor.bio,
            expertiseBMC: {
              niveauGlobal: mentor.expertiseBMC.niveauGlobal,
              blocsExpertise: mentor.expertiseBMC.blocsExpertise,
              methodologies: mentor.expertiseBMC.methodologies
            },
            disponibilite: mentor.disponibilite,
            statistiques: mentor.statistiquesBMC
          },
          score: compatibilite.scoreGlobal,
          niveau: compatibilite.niveau,
          scoresParDomaine: compatibilite.scoresParDomaine,
          justifications: compatibilite.justifications
        });
      }
    }
    
    // 5. Trier par score décroissant
    matchs.sort((a, b) => b.score - a.score);
    
    // 6. Sauvegarder les propositions de match
    const propositions = [];
    for (let i = 0; i < Math.min(limite, matchs.length); i++) {
      const match = matchs[i];
      
      const matchingProposal = new MatchingProposal({
        porteurId: porteurId,
        mentorId: match.mentorId,
        besoinsIdentifies: besoins,
        scoreGlobal: match.score,
        scoresParDomaine: match.scoresParDomaine,
        justifications: match.justifications,
        statut: 'propose'
      });
      
      await matchingProposal.save();
      
      propositions.push({
        proposalId: matchingProposal._id,
        mentor: match.mentor,
        score: match.score,
        niveau: match.niveau,
        justifications: match.justifications,
        ameliorationEstimee: estimerAmeliorationBMC(match.score)
      });
    }
    
    // 7. Générer un résumé des besoins
    const resumeBesoins = {
      scoreActuel: derniereAnalyse.scoreImpact,
      pointsCritiques: besoins.filter(b => b.urgence === 'élevée').map(b => b.description),
      recommandationsPrioritaires: besoins.slice(0, 3).map(b => b.description)
    };
    
    return {
      success: true,
      resumeBesoins,
      propositions
    };
    
  } catch (error) {
    console.error('Erreur matching BMC:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Estime l'amélioration possible du BMC
 */
const estimerAmeliorationBMC = (scoreCompatibilite) => {
  if (scoreCompatibilite >= 80) return { min: 20, max: 35, moyenne: 27 };
  if (scoreCompatibilite >= 60) return { min: 10, max: 25, moyenne: 17 };
  if (scoreCompatibilite >= 40) return { min: 5, max: 15, moyenne: 10 };
  return { min: 0, max: 10, moyenne: 5 };
};

export default {
  analyserBesoinsPorteurBMC,
  calculerScoreCompatibiliteBMC,
  trouverMeilleursMentorsBMC
};