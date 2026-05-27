import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use('/telechargements', express.static(path.join(__dirname, 'telechargements')));

// Import des routes
import authRoutes from './routes/authentification.js';
import utilisateurRoutes from './routes/utilisateurs.js';
import projetRoutes from './routes/projets.js';
import etapeRoutes from './routes/etapes.js';
import tacheRoutes from './routes/taches.js';
import documentRoutes from './routes/documents.js';
import evenementRoutes from './routes/evenements.js';
import notificationRoutes from './routes/notifications.js';
import iaRoutes from './routes/ai.js';
import soumissionRoutes from './routes/soumissions.js';
import profilRoutes from './routes/profil.js';
import mentorRoutes from './routes/mentors.js';


// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/etapes', etapeRoutes);
app.use('/api/taches', tacheRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/evenements', evenementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', iaRoutes);
app.use('/api/soumissions', soumissionRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/mentors', mentorRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur fonctionnel' });
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Incubiny est en ligne' });
});

// MongoDB - Version corrigée avec gestion d'erreur détaillée
const MONGODB_URI = process.env.MONGODB_URI;

console.log(' Vérification MONGODB_URI:', MONGODB_URI ? ' Définie' : ' NON DEFINIE');

if (!MONGODB_URI) {
  console.error(' ERREUR: MONGODB_URI non définie dans les variables d\'environnement');
  console.error(' Solution: Ajoutez MONGODB_URI dans Render Dashboard → Environment');
  process.exit(1);
}

// Vérifier le format de la chaîne
if (MONGODB_URI.includes('mongodb+srv')) {
  console.log(' Format de connexion MongoDB Atlas détecté');
} else {
  console.log(' Format de connexion MongoDB non standard');
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log(' MongoDB connecté avec succès');
  console.log(` Base de données: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error(' Erreur MongoDB détaillée:', err.message);
  console.error(' Causes possibles:');
  console.error('   1. Mauvais mot de passe dans la chaîne de connexion');
  console.error('   2. IP non autorisée (ajoutez 0.0.0.0/0 dans IP Access List)');
  console.error('   3. Nom du cluster incorrect');
  console.error('   4. Problème de réseau / DNS');
  process.exit(1);
});

// PORT
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
  console.log(` API accessible sur le port ${PORT}`);
});

// Créer les dossiers nécessaires
const dirs = [
  './telechargements',
  './telechargements/avatars',
  './telechargements/ia'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(` Dossier créé: ${fullPath}`);
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection:', reason);
});