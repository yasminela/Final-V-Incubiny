import Soumission from '../models/Soumission.js';
import Notification from '../models/Notification.js';
import Utilisateur from '../models/Utilisateur.js';

// Vérifier les soumissions proches de la deadline
export const verifierSoumissionsProches = async () => {
  const now = new Date();
  const dans24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dans48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Soumissions avec deadline dans les 24h et non encore soumises
  const soumissionsProches = await Soumission.find({
    dateLimite: { $gte: now, $lte: dans24h },
    statut: 'en_attente',
    alerteEnvoyee: false
  }).populate('porteurId');
  
  for (const soumission of soumissionsProches) {
    await Notification.create({
      utilisateurId: soumission.porteurId._id,
      titre: "Deadline approche !",
      message: `La soumission "${soumission.titre}" doit être rendue dans moins de 24h.`,
      type: 'warning',
      estLue: false,
      lien: '/#soumissions'
    });
    
    soumission.alerteEnvoyee = true;
    await soumission.save();
    console.log(`Alerte envoyée pour: ${soumission.titre}`);
  }
  
  // Soumissions avec deadline dans les 48h
  const soumissionsProches48h = await Soumission.find({
    dateLimite: { $gte: now, $lte: dans48h },
    statut: 'en_attente',
    alerteEnvoyee: false
  }).populate('porteurId');
  
  for (const soumission of soumissionsProches48h) {
    await Notification.create({
      utilisateurId: soumission.porteurId._id,
      titre: "Rappel de deadline",
      message: `La soumission "${soumission.titre}" est due dans moins de 48h.`,
      type: 'info',
      estLue: false,
      lien: '/#soumissions'
    });
    
    soumission.alerteEnvoyee = true;
    await soumission.save();
  }
};

// Vérifier les soumissions en retard
export const verifierSoumissionsRetard = async () => {
  const now = new Date();
  
  const soumissionsRetard = await Soumission.find({
    dateLimite: { $lt: now },
    statut: { $in: ['en_attente', 'soumise'] },
    alerteRetardEnvoyee: false
  }).populate('porteurId');
  
  for (const soumission of soumissionsRetard) {
    // Mettre à jour le statut
    soumission.statut = 'en_retard';
    soumission.alerteRetardEnvoyee = true;
    await soumission.save();
    
    // Envoyer notification au porteur
    await Notification.create({
      utilisateurId: soumission.porteurId._id,
      titre: "Soumission en retard !",
      message: `La soumission "${soumission.titre}" est en retard. Veuillez la déposer dès que possible.`,
      type: 'erreur',
      estLue: false,
      lien: '/#soumissions'
    });
    
    // Envoyer notification aux admins
    const admins = await Utilisateur.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        utilisateurId: admin._id,
        titre: "Soumission en retard",
        message: `${soumission.porteurId.firstName} ${soumission.porteurId.lastName} est en retard pour "${soumission.titre}".`,
        type: 'warning',
        estLue: false,
        lien: '/admin#soumissions'
      });
    }
    
    console.log(`Alerte retard pour: ${soumission.titre}`);
  }
};

// Calculer le score de ponctualité du porteur (0-100)
export const calculerScorePonctualite = async (porteurId) => {
  const soumissions = await Soumission.find({ porteurId });
  
  if (soumissions.length === 0) return 100;
  
  let total = 0;
  let penalites = 0;
  
  for (const soumission of soumissions) {
    total++;
    
    if (soumission.statut === 'en_retard') {
      penalites += 20;
    } else if (soumission.dateSoumission && soumission.dateSoumission > soumission.dateLimite) {
      penalites += 15;
    } else if (soumission.dateSoumission && soumission.dateSoumission <= soumission.dateLimite) {
      // À l'heure
      if (soumission.dateLimite - soumission.dateSoumission < 24 * 60 * 60 * 1000) {
        penalites += 5; // Petit bonus pour soumission de dernière minute
      }
    }
  }
  
  let score = Math.max(0, 100 - Math.floor(penalites));
  return Math.min(100, score);
};

// Créer une nouvelle soumission à suivre
export const creerSoumission = async (porteurId, titre, dateLimite, etapeId = null, tacheId = null) => {
  const soumission = new Soumission({
    porteurId,
    etapeId,
    tacheId,
    titre,
    dateLimite,
    statut: 'en_attente',
    alerteEnvoyee: false,
    alerteRetardEnvoyee: false
  });
  
  await soumission.save();
  
  // Notification immédiate
  await Notification.create({
    utilisateurId: porteurId,
    titre: "Nouvelle soumission à rendre",
    message: `Vous devez soumettre "${titre}" avant le ${new Date(dateLimite).toLocaleDateString()}.`,
    type: 'info',
    estLue: false,
    lien: '/#soumissions'
  });
  
  return soumission;
};

// Marquer une soumission comme faite
export const marquerSoumise = async (soumissionId, dateSoumission = null) => {
  const soumission = await Soumission.findById(soumissionId);
  if (!soumission) return null;
  
  const now = dateSoumission || new Date();
  const estEnRetard = now > soumission.dateLimite;
  
  soumission.dateSoumission = now;
  soumission.statut = estEnRetard ? 'en_retard' : 'soumise';
  await soumission.save();
  
  // Notification de confirmation
  await Notification.create({
    utilisateurId: soumission.porteurId,
    titre: estEnRetard ? "Soumission en retard" : "Soumission reçue",
    message: estEnRetard 
      ? `Votre soumission "${soumission.titre}" a été reçue avec retard.` 
      : `Votre soumission "${soumission.titre}" a été reçue dans les délais.`,
    type: estEnRetard ? 'warning' : 'succes',
    estLue: false,
    lien: '/#soumissions'
  });
  
  return soumission;
};