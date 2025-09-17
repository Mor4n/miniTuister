const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'username y password son requeridos' });

  // Verifica si el usuario ya existe
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (existing)
    return res.status(409).json({ error: 'El usuario ya existe' });

  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password: hashed }])
    .select();
  if (error) return res.status(500).json({ error: error.message });

  // Crear perfil en la tabla profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: data[0].id, username: data[0].username }]);
  if (profileError) return res.status(500).json({ error: profileError.message });

  res.status(201).json({ id: data[0].id, username: data[0].username });
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

  // Genera JWT
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));