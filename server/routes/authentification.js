import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  console.log(' Tentative:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    // Recherche directe sans transformation
    const user = await Utilisateur.findOne({ email: email });
    
    console.log(' Tentative:', req.body.email);
    console.log(' Résultat recherche:', user ? 'TROUVÉ' : 'NON TROUVÉ');
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log(' Email trouvé:', user.email);
    console.log(' firstName:', user.firstName);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(' Mot de passe valide:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'incubiny_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;