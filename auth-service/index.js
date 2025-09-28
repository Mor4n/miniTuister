
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generateToken, verifyToken, authMiddleware } from './src/utils/jwt.js';

dotenv.config();
const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('[AUTH-SERVICE] Error:', err);
  res.status(500).json({ error: 'Error interno del microservicio de autenticación' });
});
// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ error: 'username, password y email son requeridos' });

  // Verifica si el usuario ya existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (existingUser)
    return res.status(409).json({ error: 'El usuario ya existe' });

  // Verifica si el email ya existe
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingEmail)
    return res.status(409).json({ error: 'El email ya está registrado' });

  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password: hashed, email }])
    .select();
  if (error) return res.status(500).json({ error: error.message });

  // Crear perfil en la tabla profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: data[0].id, username: data[0].username }]);
  if (profileError) return res.status(500).json({ error: profileError.message });

  res.status(201).json({ id: data[0].id, username: data[0].username, email: data[0].email });
});

// Login de usuario
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'username y password son requeridos' });

  const { data: user } = await supabase
    .from('users')
    .select('id, username, password')
    .eq('username', username)
    .maybeSingle();
  if (!user)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

  // Genera JWT usando utils/jwt.js
  const token = generateToken({ id: user.id, username: user.username }, '1d');
  res.json({ token });
// Endpoint para verificar token
app.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});
});



const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));