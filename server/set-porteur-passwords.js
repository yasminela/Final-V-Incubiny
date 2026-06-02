import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'utilisateurs');

const porteurs = [
  { email: 'achraf.meddeb@polytechnicien.tn', motDePasse: 'Incuachraf530biny' },
  { email: 'maroua.hattab@polytechnicien.tn', motDePasse: 'Incumaroua995biny' },
  { email: 'chaima.massaoudi@polytechnicien.tn', motDePasse: 'Incuchaima537biny' },
  { email: 'amel.jaballah@polytechnicien.tn', motDePasse: 'Incuamel995biny' },
  { email: 'nour.rezgui.122004@gmail.com', motDePasse: 'Incunour962biny' },
  { email: 'Zouhour.Rezgui@esprit.tn', motDePasse: 'Incuzouhour962biny' },
];

async function setPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/incubiny');
    console.log('Connecté à MongoDB\n');

    for (const porteur of porteurs) {
      const hash = await bcrypt.hash(porteur.motDePasse, 10);
      const result = await User.updateOne(
        { email: porteur.email },
        { $set: { password: hash, role: 'porteur' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`${porteur.email} → ${porteur.motDePasse}`);
      } else {
        console.log(`${porteur.email} non trouvé ou déjà à jour`);
      }
    }

    console.log('\n Tous les mots de passe ont été configurés !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

setPasswords();