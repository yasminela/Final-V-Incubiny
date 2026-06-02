import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Générer un token pour admin
const token = jwt.sign(
  { id: 'admin123', email: 'admin@incubiny.com', role: 'admin' },
  process.env.JWT_SECRET || 'incubiny_secret_key_2024_very_secure',
  { expiresIn: '7d' }
);

console.log('Token admin:');
console.log(token);
console.log('\n À utiliser dans Postman:');
console.log(`Authorization: Bearer ${token}`);