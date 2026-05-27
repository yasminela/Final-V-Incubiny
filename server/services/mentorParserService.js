import fs from 'fs';
import pdfParse from 'pdf-parse';

// Mots-clés pour l'analyse du CV
const MOTS_CLES_BMC = {
  propositionValeur: [
    'proposition de valeur', 'value proposition', 'valeur ajoutée', 'bénéfice client',
    'customer benefit', 'problem solution', 'problème solution'
  ],
  segmentsClients: [
    'segment client', 'customer segment', 'cible', 'target', 'persona', 'client idéal'
  ],
  fluxRevenus: [
    'flux revenus', 'revenue stream', 'modèle revenu', 'business model', 'monétisation'
  ],
  structureCouts: [
    'structure coût', 'cost structure', 'charges', 'dépenses', 'investissement'
  ]
};

const METHODOLOGIES_BMC = [
  'value proposition design', 'lean canvas', 'business model canvas',
  'design thinking', 'customer development', 'blue ocean'
];

/**
 * Extrait les informations d'un CV mentor depuis un PDF
 */
export const extraireInfosMentorFromPDF = async (pdfPath) => {
  try {
    const dataBuffer = await fs.promises.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    const texte = data.text.toLowerCase();
    
    console.log('📄 Extraction du CV mentor...');
    
    // 1. Extraire nom et email
    let firstName = '';
    let lastName = '';
    let email = '';
    
    const emailMatch = texte.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      email = emailMatch[1];
    }
    
    const lignes = texte.split('\n');
    for (const ligne of lignes.slice(0, 10)) {
      const mots = ligne.trim().split(/\s+/);
      if (mots.length === 2 && mots[0].length > 2 && mots[1].length > 2) {
        firstName = mots[0];
        lastName = mots[1];
        break;
      }
    }
    
    // 2. Analyser l'expertise BMC
    const expertiseBMC = analyserExpertiseBMC(texte);
    
    // 3. Extraire les années d'expérience
    const anneesExperience = extraireAnneesExperience(texte);
    
    // 4. Extraire les méthodologies maîtrisées
    const methodologies = extraireMethodologies(texte);
    
    // 5. Extraire la disponibilité
    let heuresParSemaine = 5;
    const heuresMatch = texte.match(/(\d+)\s*heures?\s*par\s*semaine/i);
    if (heuresMatch) {
      heuresParSemaine = parseInt(heuresMatch[1]);
    }
    
    return {
      success: true,
      donnees: {
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        email: email,
        bio: `Expert en Business Model Canvas. ${anneesExperience > 0 ? `${anneesExperience} ans d'expérience.` : ''}`,
        expertiseBMC: expertiseBMC,
        methodologies: methodologies,
        disponibilite: { heuresParSemaine: heuresParSemaine }
      }
    };
    
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return { success: false, message: error.message };
  }
};

const analyserExpertiseBMC = (texte) => {
  const blocsExpertise = {};
  let scoreGlobal = 0;
  let compteur = 0;
  
  for (const [bloc, motsCles] of Object.entries(MOTS_CLES_BMC)) {
    let score = 0;
    
    for (const mot of motsCles) {
      if (texte.includes(mot.toLowerCase())) {
        score += 25;
      }
    }
    
    score = Math.min(100, score);
    const niveau = Math.max(0, Math.min(5, Math.ceil(score / 20)));
    
    blocsExpertise[bloc] = {
      niveau: niveau,
      anneesExperience: 0,
      motsClesMaitrises: []
    };
    
    scoreGlobal += score;
    compteur++;
  }
  
  const niveauGlobal = Math.max(1, Math.min(5, Math.ceil((scoreGlobal / compteur) / 20)));
  
  if (blocsExpertise.propositionValeur?.niveau >= 3) {
    return {
      niveauGlobal: Math.min(5, niveauGlobal + 1),
      blocsExpertise: blocsExpertise
    };
  }
  
  return {
    niveauGlobal: niveauGlobal,
    blocsExpertise: blocsExpertise
  };
};

const extraireAnneesExperience = (texte) => {
  const patterns = [
    /(\d+)\s*ans?\s+d['']expérience/i,
    /(\d+)\s*years?\s+of\s+experience/i,
    /expérience\s+de\s+(\d+)\s+ans/i
  ];
  
  for (const pattern of patterns) {
    const match = texte.match(pattern);
    if (match) return parseInt(match[1]);
  }
  
  return 0;
};

const extraireMethodologies = (texte) => {
  const methodologies = [];
  
  for (const methode of METHODOLOGIES_BMC) {
    if (texte.includes(methode.toLowerCase())) {
      methodologies.push({
        nom: methode,
        niveau: 3,
        certifications: []
      });
    }
  }
  
  return methodologies;
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default {
  extraireInfosMentorFromPDF
};