import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  // Informations générales
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  cvUrl: { type: String, default: null },
  source: { type: String, enum: ['manuel', 'scan_pdf'], default: 'manuel' },
  
  // Expertise BMC (focus principal)
  expertiseBMC: {
    niveauGlobal: { type: Number, min: 1, max: 5, default: 3 },
    blocsExpertise: {
      propositionValeur: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 },
        motsClesMaitrises: [String]
      },
      segmentsClients: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      canaux: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      relationsClients: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      fluxRevenus: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      ressourcesCles: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      activitesCles: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      partenariatsCles: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      },
      structureCouts: { 
        niveau: { type: Number, min: 0, max: 5, default: 0 },
        anneesExperience: { type: Number, default: 0 }
      }
    },
    methodologies: [{
      nom: { type: String },
      niveau: { type: Number, min: 1, max: 5 },
      certifications: [String]
    }]
  },
  
  // Expertises secondaires
  expertisesSecondaires: [{
    domaine: { 
      type: String, 
      enum: ['finance', 'marketing', 'technologie', 'pitch', 'scaling', 'rh', 'juridique']
    },
    niveau: { type: Number, min: 1, max: 5 },
    anneesExperience: Number
  }],
  
  // Disponibilité
  disponibilite: {
    heuresParSemaine: { type: Number, default: 5 },
    langues: [{
      langue: String,
      niveau: { type: String, enum: ['débutant', 'intermédiaire', 'courant', 'natif'] }
    }]
  },
  
  // Statistiques
  statistiquesBMC: {
    nbPorteursAccompagnes: { type: Number, default: 0 },
    ameliorationMoyenneScore: { type: Number, default: 0 },
    tauxReussite: { type: Number, default: 0 },
    successStories: [{
      porteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
      porteurNom: String,
      avant: String,
      apres: String,
      ameliorationScore: Number,
      temoignage: String,
      date: { type: Date, default: Date.now }
    }]
  },
  
  // Statut
  estDisponible: { type: Boolean, default: true },
  estVerifie: { type: Boolean, default: false },
  
  dateCreation: { type: Date, default: Date.now },
  dateModification: { type: Date, default: Date.now }
});

export default mongoose.model('Mentor', mentorSchema);