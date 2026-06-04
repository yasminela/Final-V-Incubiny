import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  telephone: String,
  faculte: String,
  residence: String,
  nomProjet: String
}, { collection: 'utilisateurs' });

const User = mongoose.model('User', userSchema);

// Liste des utilisateurs à créer
const users = [
  // ADMIN
  {
    firstName: "Admin",
    lastName: "Incubiny",
    email: "admin@incubiny.com",
    password: "admin123",
    role: "admin",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  // PORTEURS
  {
    firstName: "Achraf",
    lastName: "Meddeb",
    email: "achraf.meddeb@polytechnicien.tn",
    password: "Incuachraf530biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  {
    firstName: "Maroua",
    lastName: "Hattab",
    email: "maroua.hattab@polytechnicien.tn",
    password: "Incumaroua995biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  {
    firstName: "Chaima",
    lastName: "Massaoudi",
    email: "chaima.massaoudi@polytechnicien.tn",
    password: "Incuchaima537biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  {
    firstName: "Amel",
    lastName: "Jaballah",
    email: "amel.jaballah@polytechnicien.tn",
    password: "Incuamel995biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  {
    firstName: "Nour",
    lastName: "Rezgui",
    email: "nour.rezgui.122004@gmail.com",
    password: "Incunour962biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },
  {
    firstName: "Zouhour",
    lastName: "Rezgui",
    email: "Zouhour.Rezgui@esprit.tn",
    password: "Incuzouhour962biny",
    role: "porteur",
    telephone: "",
    faculte: "",
    residence: "",
    nomProjet: ""
  },

];

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connecté à MongoDB Atlas\n');
    
    for (const user of users) {
      // Vérifier si l'utilisateur existe déjà
      const existing = await User.findOne({ email: user.email });
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      if (existing) {
        // Mettre à jour le mot de passe si l'utilisateur existe
        await User.updateOne(
          { email: user.email },
          { $set: { password: hashedPassword, firstName: user.firstName, lastName: user.lastName, role: user.role } }
        );
        console.log(` Mis à jour: ${user.email} (${user.role})`);
      } else {
        // Créer un nouvel utilisateur
        const newUser = new User({
          ...user,
          password: hashedPassword
        });
        await newUser.save();
        console.log(` Créé: ${user.email} (${user.role})`);
      }
    }
    
    console.log('\n Tous les utilisateurs ont été créés/mis à jour !');
    console.log('\n Récapitulatif:');
    console.log('   Admin: admin@incubiny.com / admin123');
    console.log('   Porteurs: 6 porteurs créés');
    
    process.exit();
  } catch (error) {
    console.error(' Erreur:', error);
    process.exit(1);
  }
}

createUsers();