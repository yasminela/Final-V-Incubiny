// server/models/AIAnalysis.js - VERSION ORIGINALE
import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema({
  porteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  fichierBMC: {
    type: String,
    required: true
  },
  cheminFichier: {
    type: String
  },
  scoreImpact: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  niveauImpact: {
    type: String,
    enum: ['faible', 'moyen', 'fort'],
    required: true
  },
  secteur: {
    nom: String,
    icone: String,
    couleur: String
  },
  recommandations: [{
    type: String
  }],
  formations: [{
    type: String
  }],
  evenements: [{
    type: String
  }],
  feedback: {
    type: String
  },
  feedbackAdmin: {
    type: String
  },
  dateFeedback: {
    type: Date
  },
  dateAnalyse: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AIAnalysis', aiAnalysisSchema);