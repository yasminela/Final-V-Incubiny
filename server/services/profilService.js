import Utilisateur from '../models/Utilisateur.js';
import Projet from '../models/Projet.js';
import Etape from '../models/Etape.js';
import Document from '../models/Document.js';
import Notification from '../models/Notification.js';

// Calculer le pourcentage de complétion du profil (démarre à 0%)
export const calculerScoreProfil = async (porteurId) => {
  const porteur = await Utilisateur.findById(porteurId);
  if (!porteur) return 0;
  
  let score = 0;  // Démarre à 0%
  
  // 1. Informations personnelles (20% total - 5% chacun)
  if (porteur.firstName && porteur.firstName !== '') score += 5;
  if (porteur.lastName && porteur.lastName !== '') score += 5;
  if (porteur.email && porteur.email !== '') score += 5;
  if (porteur.telephone && porteur.telephone !== '') score += 5;
  
  // 2. Informations académiques (15% total)
  if (porteur.faculte && porteur.faculte !== '') score += 8;
  if (porteur.residence && porteur.residence !== '') score += 7;
  
  // 3. Projet (20% total)
  const projets = await Projet.find({ porteurId });
  if (projets.length > 0) {
    score += 10;  // Projet créé
    const projetsValides = projets.filter(p => p.statut === 'valide').length;
    if (projetsValides > 0) score += 10;  // Projet validé
  }
  
  // 4. Documents soumis (25% total - 5% par document, max 5 documents)
  const documents = await Document.find({ uploadPar: porteurId });
  const totalDocs = Math.min(documents.length, 5);
  score += totalDocs * 5;
  
  // 5. Étapes validées (20% total - 5% par étape, max 4 étapes)
  const etapes = await Etape.find({ porteurId, statut: 'validee' });
  const totalEtapes = Math.min(etapes.length, 4);
  score += totalEtapes * 5;
  
  return Math.min(100, Math.round(score));
};

// Obtenir le détail du score avec breakdown
export const getDetailsScore = async (porteurId) => {
  const porteur = await Utilisateur.findById(porteurId);
  if (!porteur) return null;
  
  const projets = await Projet.find({ porteurId });
  const documents = await Document.find({ uploadPar: porteurId });
  const etapesValidees = await Etape.find({ porteurId, statut: 'validee' });
  
  return {
    personnel: {
      total: 20,
      obtenu: (porteur.firstName ? 5 : 0) + (porteur.lastName ? 5 : 0) + (porteur.email ? 5 : 0) + (porteur.telephone ? 5 : 0),
      details: {
        firstName: porteur.firstName ? 5 : 0,
        lastName: porteur.lastName ? 5 : 0,
        email: porteur.email ? 5 : 0,
        telephone: porteur.telephone ? 5 : 0
      }
    },
    academique: {
      total: 15,
      obtenu: (porteur.faculte ? 8 : 0) + (porteur.residence ? 7 : 0),
      details: {
        faculte: porteur.faculte ? 8 : 0,
        residence: porteur.residence ? 7 : 0
      }
    },
    projet: {
      total: 20,
      obtenu: (projets.length > 0 ? 10 : 0) + (projets.some(p => p.statut === 'valide') ? 10 : 0),
      details: {
        projetCree: projets.length > 0 ? 10 : 0,
        projetValide: projets.some(p => p.statut === 'valide') ? 10 : 0
      }
    },
    documents: {
      total: 25,
      obtenu: Math.min(documents.length * 5, 25),
      compteur: documents.length,
      max: 5
    },
    etapes: {
      total: 20,
      obtenu: Math.min(etapesValidees.length * 5, 20),
      compteur: etapesValidees.length,
      max: 4
    },
    scoreTotal: Math.min(100, 
      (porteur.firstName ? 5 : 0) + (porteur.lastName ? 5 : 0) + (porteur.email ? 5 : 0) + (porteur.telephone ? 5 : 0) +
      (porteur.faculte ? 8 : 0) + (porteur.residence ? 7 : 0) +
      (projets.length > 0 ? 10 : 0) + (projets.some(p => p.statut === 'valide') ? 10 : 0) +
      Math.min(documents.length * 5, 25) +
      Math.min(etapesValidees.length * 5, 20)
    )
  };
};

// Obtenir tous les scores des porteurs (pour admin)
export const getAllPorteursScores = async () => {
  const porteurs = await Utilisateur.find({ role: 'porteur' });
  const scores = [];
  
  for (const porteur of porteurs) {
    const score = await calculerScoreProfil(porteur._id);
    scores.push({
      id: porteur._id,
      firstName: porteur.firstName,
      lastName: porteur.lastName,
      email: porteur.email,
      score: score,
      telephone: porteur.telephone || '',
      faculte: porteur.faculte || '',
      residence: porteur.residence || '',
      nomProjet: porteur.nomProjet || ''
    });
  }
  
  return scores.sort((a, b) => b.score - a.score);
};

// Vérifier les profils incomplets
export const verifierProfilsIncomplets = async () => {
  const porteurs = await Utilisateur.find({ role: 'porteur' });
  const admins = await Utilisateur.find({ role: 'admin' });
  
  for (const porteur of porteurs) {
    const score = await calculerScoreProfil(porteur._id);
    
    if (score < 30) {
      await Notification.create({
        utilisateurId: porteur._id,
        titre: "Commencez à soumettre vos documents",
        message: `Votre profil est complété à ${score}%. Soumettez vos premiers documents pour augmenter votre score.`,
        type: 'info',
        estLue: false,
        lien: '/#suiviEtapes'
      });
    }
    
    if (score < 20) {
      for (const admin of admins) {
        await Notification.create({
          utilisateurId: admin._id,
          titre: "Nouveau porteur inactif",
          message: `${porteur.firstName} ${porteur.lastName} n'a encore soumis aucun document.`,
          type: 'warning',
          estLue: false,
          lien: '/admin#porteurs'
        });
      }
    }
  }
};