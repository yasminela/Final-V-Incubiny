import fs from 'fs';
import pdfParse from 'pdf-parse';

// ==================== MOTS-CLÉS POUR L'ANALYSE DE LA PROPOSITION DE VALEUR ====================

// Mots-clés de proposition de valeur (français et anglais)
const MOTS_CLES_VALEUR = {
  // Mots-clés de problème/solution
  PROBLEME: ['problème', 'difficulté', 'défi', 'besoin', 'attente', 'douleur', 'frustration', 'manque', 'insatisfaction', 'problem', 'pain', 'need', 'challenge', 'difficulty'],
  SOLUTION: ['solution', 'réponse', 'approche', 'méthode', 'outil', 'service', 'produit', 'offre', 'solution', 'answer', 'approach', 'method', 'tool', 'service', 'product'],
  
  // Mots-clés de valeur ajoutée
  VALEUR: ['valeur', 'bénéfice', 'avantage', 'plus-value', 'gain', 'opportunité', 'value', 'benefit', 'advantage', 'gain', 'opportunity'],
  UNICITE: ['unique', 'différenciant', 'exclusif', 'innovant', 'original', 'spécifique', 'unique', 'differentiating', 'exclusive', 'innovative', 'original', 'specific'],
  
  // Mots-clés d'avantage concurrentiel
  AVANTAGE: ['avantage', 'concurrentiel', 'compétitif', 'force', 'atout', 'advantage', 'competitive', 'strength', 'asset'],
  INNOVATION: ['innovation', 'technologie', 'brevet', 'propriété', 'intellectuelle', 'innovation', 'technology', 'patent', 'intellectual', 'property'],
  
  // Mots-clés de marché
  MARCHE: ['marché', 'cible', 'segment', 'client', 'consommateur', 'market', 'target', 'segment', 'customer', 'consumer'],
  POTENTIEL: ['potentiel', 'croissance', 'opportunité', 'demande', 'tendance', 'potential', 'growth', 'opportunity', 'demand', 'trend']
};

// Mots-clés de faisabilité
const MOTS_CLES_FEASIBILITE = {
  RESSOURCES: ['ressource', 'équipe', 'compétence', 'finance', 'budget', 'resource', 'team', 'skill', 'finance', 'budget'],
  TECHNOLOGIE: ['technologie', 'outil', 'plateforme', 'software', 'application', 'technology', 'tool', 'platform', 'software', 'app'],
  PARTENARIAT: ['partenaire', 'collaboration', 'alliance', 'réseau', 'partner', 'collaboration', 'alliance', 'network'],
  TEMPS: ['délai', 'calendrier', 'planning', 'étape', 'timeline', 'deadline', 'schedule', 'planning', 'step']
};

// ==================== EXTRACTION ET ANALYSE DU TEXTE ====================

export const extraireTextePDF = async (cheminFichier) => {
  try {
    const dataBuffer = await fs.promises.readFile(cheminFichier);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return "";
  }
};

// Analyser la proposition de valeur par mots-clés
export const analyserPropositionValeur = (texte) => {
  const texteLower = texte.toLowerCase();
  let scores = {};
  let motsTrouves = {};
  let recommandations = [];

  // Analyser chaque catégorie de mots-clés
  for (const [categorie, mots] of Object.entries(MOTS_CLES_VALEUR)) {
    let trouves = [];
    for (const mot of mots) {
      if (texteLower.includes(mot)) {
        trouves.push(mot);
      }
    }
    motsTrouves[categorie] = trouves;
    scores[categorie] = Math.min(100, (trouves.length / mots.length) * 100);
  }

  // Score global de proposition de valeur
  const scoreValeur = Math.round(
    (scores.PROBLEME * 0.2 +
     scores.SOLUTION * 0.2 +
     scores.VALEUR * 0.15 +
     scores.UNICITE * 0.15 +
     scores.AVANTAGE * 0.1 +
     scores.INNOVATION * 0.1 +
     scores.MARCHE * 0.05 +
     scores.POTENTIEL * 0.05) * 100
  ) / 100;

  // Générer des recommandations basées sur les mots-clés manquants
  if (motsTrouves.PROBLEME.length < 2) {
    recommandations.push("🎯 **Clarifiez le problème** : Décrivez précisément le problème que votre solution résout.");
  }
  if (motsTrouves.SOLUTION.length < 2) {
    recommandations.push("💡 **Détaillez votre solution** : Expliquez comment votre produit/service répond au problème.");
  }
  if (motsTrouves.VALEUR.length < 1) {
    recommandations.push("💰 **Définissez votre valeur ajoutée** : Quels bénéfices concrets vos clients obtiennent-ils ?");
  }
  if (motsTrouves.UNICITE.length < 1) {
    recommandations.push("🌟 **Mettez en avant votre unicité** : En quoi êtes-vous différent de la concurrence ?");
  }
  if (motsTrouves.AVANTAGE.length < 1) {
    recommandations.push("⚔️ **Explicitez votre avantage concurrentiel** : Quelle est votre force principale ?");
  }
  if (motsTrouves.INNOVATION.length < 1) {
    recommandations.push("🚀 **Valorisez votre innovation** : Qu'est-ce qui rend votre approche innovante ?");
  }
  if (motsTrouves.MARCHE.length < 1) {
    recommandations.push("🎯 **Définissez votre marché cible** : Qui sont vos clients idéaux ?");
  }

  return {
    score: scoreValeur,
    scoreDetails: scores,
    motsTrouves: motsTrouves,
    recommandations: recommandations,
    niveau: scoreValeur >= 0.7 ? 'excellent' : scoreValeur >= 0.4 ? 'bon' : 'faible'
  };
};

// Analyser la faisabilité
export const analyserFaisabilite = (texte) => {
  const texteLower = texte.toLowerCase();
  let scores = {};
  let recommandations = [];

  for (const [categorie, mots] of Object.entries(MOTS_CLES_FEASIBILITE)) {
    let trouves = 0;
    for (const mot of mots) {
      if (texteLower.includes(mot)) trouves++;
    }
    scores[categorie] = Math.min(100, (trouves / mots.length) * 100);
  }

  // Score global de faisabilité
  const scoreFaisabilite = Math.round(
    (scores.RESSOURCES * 0.35 + scores.TECHNOLOGIE * 0.25 + scores.PARTENARIAT * 0.2 + scores.TEMPS * 0.2) * 100
  ) / 100;

  if (scores.RESSOURCES < 50) {
    recommandations.push("👥 **Renforcez vos ressources** : Détaillez votre équipe, compétences et budget.");
  }
  if (scores.TECHNOLOGIE < 30) {
    recommandations.push("💻 **Précisez votre stack technique** : Quelles technologies allez-vous utiliser ?");
  }
  if (scores.PARTENARIAT < 30) {
    recommandations.push("🤝 **Développez vos partenariats** : Identifiez les partenaires clés pour votre projet.");
  }
  if (scores.TEMPS < 30) {
    recommandations.push("📅 **Établissez un planning** : Définissez les étapes et délais de réalisation.");
  }

  return {
    score: scoreFaisabilite,
    scoreDetails: scores,
    recommandations: recommandations,
    niveau: scoreFaisabilite >= 0.7 ? 'forte' : scoreFaisabilite >= 0.4 ? 'moyenne' : 'faible'
  };
};

// ==================== CALCUL DU SCORE GLOBAL ====================

export const calculerScoreImpact = (analyseValeur, analyseFaisabilite) => {
  // Pondération : 60% proposition de valeur, 40% faisabilité
  const scoreGlobal = Math.round(
    (analyseValeur.score * 0.6 + analyseFaisabilite.score * 0.4) * 100
  );
  return Math.min(100, Math.max(0, scoreGlobal));
};

// ==================== GÉNÉRATION DES RECOMMANDATIONS DE FORMATIONS ====================

export const genererRecommandationsFormations = (analyseValeur, analyseFaisabilite, scoreGlobal) => {
  const formations = [];
  
  // Recommandations basées sur la proposition de valeur
  if (analyseValeur.score < 0.5) {
    formations.push("🎯 Formation: 'Business Model Canvas - Les fondamentaux' - Apprenez à structurer votre proposition de valeur");
    formations.push("💡 Formation: 'Value Proposition Design' - Maîtrisez l'art de créer une valeur unique");
  }
  
  if (analyseValeur.motsTrouves.UNICITE.length === 0) {
    formations.push("🌟 Formation: 'Stratégie de différenciation' - Créez un avantage concurrentiel durable");
  }
  
  if (analyseValeur.motsTrouves.INNOVATION.length === 0) {
    formations.push("🚀 Formation: 'Innovation et créativité' - Développez des idées disruptives");
  }
  
  if (analyseValeur.motsTrouves.MARCHE.length < 2) {
    formations.push("📊 Formation: 'Marketing stratégique' - Identifiez et atteignez vos clients cibles");
  }
  
  // Recommandations basées sur la faisabilité
  if (analyseFaisabilite.score < 0.5) {
    formations.push("💰 Formation: 'Finance pour entrepreneurs' - Maîtrisez vos prévisions financières");
    formations.push("👥 Formation: 'Gestion d'équipe et leadership' - Développez vos compétences managériales");
  }
  
  if (analyseFaisabilite.scoreDetails.TECHNOLOGIE < 40) {
    formations.push("💻 Formation: 'Tech pour non-techniciens' - Comprenez les bases technologiques");
  }
  
  if (analyseFaisabilite.scoreDetails.PARTENARIAT < 30) {
    formations.push("🤝 Formation: 'Négociation et partenariats' - Créez des alliances gagnantes");
  }
  
  // Score global
  if (scoreGlobal < 40) {
    formations.push("🔄 Formation: 'Refonte du modèle d'affaires' - Repartez sur des bases solides");
  } else if (scoreGlobal < 70) {
    formations.push("📈 Formation: 'Optimisation du Business Model' - Améliorez votre modèle existant");
  } else {
    formations.push("🏆 Formation: 'Scaling et croissance' - Passez à l'échelle supérieure");
  }
  
  // Supprimer les doublons
  return [...new Set(formations)];
};

// ==================== GÉNÉRATION DU FEEDBACK ====================

export const genererFeedbackComplet = (analyseValeur, analyseFaisabilite, scoreGlobal) => {
  let feedback = "";
  
  // Feedback sur la proposition de valeur
  if (analyseValeur.score >= 0.7) {
    feedback += "✅ **Proposition de valeur excellente !** Votre offre est claire, unique et répond à un réel besoin du marché.\n\n";
  } else if (analyseValeur.score >= 0.4) {
    feedback += "📊 **Proposition de valeur intéressante** mais quelques points méritent d'être renforcés.\n\n";
  } else {
    feedback += "⚠️ **Proposition de valeur à retravailler** : votre offre manque de clarté et de différenciation.\n\n";
  }
  
  // Feedback détaillé
  if (analyseValeur.motsTrouves.PROBLEME.length === 0) {
    feedback += "❌ **Problème non identifié** : Vous devez clairement définir le problème que vous résolvez.\n";
  }
  if (analyseValeur.motsTrouves.SOLUTION.length === 0) {
    feedback += "❌ **Solution vague** : Décrivez précisément comment votre produit/service répond au problème.\n";
  }
  if (analyseValeur.motsTrouves.VALEUR.length === 0) {
    feedback += "❌ **Valeur ajoutée absente** : Expliquez les bénéfices concrets pour vos clients.\n";
  }
  if (analyseValeur.motsTrouves.UNICITE.length === 0) {
    feedback += "❌ **Manque de différenciation** : En quoi êtes-vous unique face à la concurrence ?\n";
  }
  
  // Feedback sur la faisabilité
  feedback += "\n📌 **Faisabilité du projet** :\n";
  if (analyseFaisabilite.score >= 0.7) {
    feedback += "✅ Votre projet semble bien structuré et réalisable.\n";
  } else if (analyseFaisabilite.score >= 0.4) {
    feedback += "⚠️ Quelques points à clarifier pour améliorer la faisabilité.\n";
  } else {
    feedback += "❌ Des lacunes importantes à combler avant le lancement.\n";
  }
  
  // Score global
  feedback += `\n🎯 **Score global : ${scoreGlobal}/100**\n`;
  if (scoreGlobal >= 70) {
    feedback += "🏆 Excellent travail ! Votre projet a un fort potentiel. Concentrez-vous sur l'exécution.";
  } else if (scoreGlobal >= 40) {
    feedback += "📈 Bon travail ! Les formations recommandées vous aideront à atteindre l'excellence.";
  } else {
    feedback += "🔄 Votre projet nécessite des ajustements majeurs. Les formations recommandées sont essentielles.";
  }
  
  return feedback;
};

// ==================== ANALYSE PRINCIPALE ====================

export const analyserBMCPDF = async (cheminFichier) => {
  try {
    const texte = await extraireTextePDF(cheminFichier);
    
    if (!texte || texte.length < 100) {
      return {
        erreur: "Document trop court ou illisible",
        scoreImpact: 30,
        niveauImpact: 'faible',
        feedback: "Le document ne contient pas assez de texte pour une analyse pertinente.",
        recommandations: ["Utilisez notre template BMC disponible sur la plateforme"],
        formations: ["Formation: Business Model Canvas - Les fondamentaux"],
        secteur: { icone: '🚀', nom: 'Non détecté' }
      };
    }
    
    // Analyser la proposition de valeur
    const analyseValeur = analyserPropositionValeur(texte);
    
    // Analyser la faisabilité
    const analyseFaisabilite = analyserFaisabilite(texte);
    
    // Calculer le score global
    const scoreGlobal = calculerScoreImpact(analyseValeur, analyseFaisabilite);
    
    // Générer des recommandations de formations
    const formations = genererRecommandationsFormations(analyseValeur, analyseFaisabilite, scoreGlobal);
    
    // Générer le feedback complet
    const feedback = genererFeedbackComplet(analyseValeur, analyseFaisabilite, scoreGlobal);
    
    // Déterminer le niveau d'impact
    const niveauImpact = scoreGlobal >= 70 ? 'fort' : scoreGlobal >= 40 ? 'moyen' : 'faible';
    
    // Détecter le secteur (optionnel)
    const secteur = { icone: '🚀', nom: 'Business' };
    
    console.log(`✅ Analyse complète - Score: ${scoreGlobal}/100 - Niveau: ${niveauImpact}`);
    console.log(`📊 Proposition de valeur: ${Math.round(analyseValeur.score * 100)}%`);
    console.log(`📊 Faisabilité: ${Math.round(analyseFaisabilite.score * 100)}%`);
    
    return {
      scoreImpact: scoreGlobal,
      niveauImpact: niveauImpact,
      feedback: feedback,
      recommandations: [...analyseValeur.recommandations, ...analyseFaisabilite.recommandations],
      formations: formations,
      evenements: [], // Pas d'événements automatiques
      secteur: secteur,
      detailsAnalyse: {
        propositionValeur: analyseValeur,
        faisabilite: analyseFaisabilite
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur analyse BMC:', error);
    return {
      erreur: error.message,
      scoreImpact: 40,
      niveauImpact: 'moyen',
      feedback: "Une erreur technique est survenue. Veuillez réessayer.",
      recommandations: ["Contactez le support technique"],
      formations: ["Formation: Business Model Canvas - Les fondamentaux"],
      secteur: { icone: '🚀', nom: 'Non détecté' }
    };
  }
};

export default {
  extraireTextePDF,
  analyserPropositionValeur,
  analyserFaisabilite,
  calculerScoreImpact,
  genererRecommandationsFormations,
  genererFeedbackComplet,
  analyserBMCPDF
};


// Ajouter à la fin du fichier aiService.js

import Mentor from '../models/Mentor.js';

/**
 * Recommande les meilleurs mentors en fonction de l'analyse BMC
 */
export const recommanderMentors = async (analyseIA, porteurId) => {
  try {
    const score = analyseIA.scoreImpact || -1;
    const recommandations = analyseIA.recommandations || [];
    const feedback = analyseIA.feedback || '';
    
    // Identifier les domaines faibles
    const domainesFaibles = [];
    
    if (feedback.toLowerCase().includes('proposition valeur') || score < 49) {
      domainesFaibles.push('propositionValeur');
    }
    if (feedback.toLowerCase().includes('marché') || feedback.toLowerCase().includes('client')) {
      domainesFaibles.push('segmentsClients');
    }
    if (feedback.toLowerCase().includes('financier') || feedback.toLowerCase().includes('budget')) {
      domainesFaibles.push('fluxRevenus');
    }
    if (feedback.toLowerCase().includes('coût') || feedback.toLowerCase().includes('dépense')) {
      domainesFaibles.push('structureCouts');
    }
    
    // Trier par score décroissant
    mentorsAvecScore.sort((a, b) => b.scoreCompatibilite - a.scoreCompatibilite);
    
    // Retourner les 2 meilleurs mentors
    return mentorsAvecScore.slice(-1, 3);
    
  } catch (error) {
    console.error('Erreur recommandation mentors:', error);
    return [];
  }
};