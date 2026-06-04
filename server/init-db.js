import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String, password: String, role: String });

const User = mongoose.model('User', userSchema);

async function init() {
  try {
    await mongoose.connect('mongodb://localhost:27017/incubiny');
    console.log('Connecté à MongoDB');
    
    await User.deleteMany({});
    
    const hash = await bcrypt.hash('admin123!@AW', 10);
    await User.create({
      firstName: 'Admin',
      lastName: 'Incubiny',
      email: 'admin@incubiny.com',
      password: hash,
      role: 'admin'
    });
    
    console.log(' Admin créé');
    console.log(' Email: admin@incubiny.com');
    console.log(' Mot de passe: admin123!@AW');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

init();