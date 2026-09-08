const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const db = new DatabaseSync('database.db');

// --- DATABASE TABLES SETUP ---
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    student_number TEXT UNIQUE NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

app.use(express.json());
app.use(express.static('.'));

// --- REGISTER ROUTE ---
app.post('/register', (req, res) => {
  const { role, email, username, password, student_number } = req.body;

  try {
    if (role === 'student') {
      db.prepare('INSERT INTO students (email, username, password, student_number) VALUES (?, ?, ?, ?)').run(email, username, password, student_number);
    } else if (role === 'teacher') {
      db.prepare('INSERT INTO teachers (email, username, password) VALUES (?, ?, ?)').run(email, username, password);
    } else if (role === 'admin') {
      db.prepare('INSERT INTO admins (email, username, password) VALUES (?, ?, ?)').run(email, username, password);
    } else {
      return res.status(400).send('Invalid role selected!');
    }
    res.send('Registered successfully!');
  } catch (err) {
    res.send('Registration failed! (User/Email/Number already exists)');
  }
});

// --- LOGIN ROUTE ---
app.post('/login', (req, res) => {
  const { role, username, password } = req.body;
  
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.send('Invalid role selected!');
  }

  // Query the selected role table
  const user = db.prepare(`SELECT * FROM ${role}s WHERE username = ?`).get(username);

  if (!user) return res.send('User not found!');
  if (user.password !== password) return res.send('Wrong password!');

  res.send(`Welcome ${user.username} (${role})!`);
});

app.listen(3000, '0.0.0.0', () => console.log('Server running on http://localhost:3000'));