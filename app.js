const express = require('express');
const app = express();
const port = 3000;

const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
  host: 'localhost', // Replace with your database host
  user: 'root', // Replace with your database username
  password: '', // Replace with your database password
  database: 'blog', // Replace with your database name
});

const secretKey = 'your-secret-key';

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

const users = [
    { id: 1, username: 'user@gmail.com', password: 'bjit1234' }
  ];
  
app.use(express.json());

app.get('/users', (req, res) => {
    const sqlQuery = 'SELECT * FROM user_info';
    connection.query(sqlQuery, (err, results) => {
    if (err) {
        res.status(401).json({ error: 'Something went wrong' });
    } else {
        res.status(200).json({ results });
    }
    });
})

app.post('/auth', (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      req.user = decoded;
      next();
    });
};
  
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.user.userId });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});