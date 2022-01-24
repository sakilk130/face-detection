const express = require('express');
const app = express();
const { users } = require('./db/db');

app.use(express.json());

app.get('/', (req, res) => {
  res.json(users);
});

app.post('/signin', (req, res) => {
  if (
    req.body.email === users[0].email &&
    req.body.password === users[0].password
  ) {
    res.json('success');
  } else {
    res.status(400).json('error logging in');
  }
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  users.push({
    id: users[users.length - 1].id + 1,
    name,
    email,
    password,
    entries: 0,
    joined: new Date(),
  });
  res.json(users[users.length - 1]);
});

app.listen(5000, () => {
  console.log('server is running on 5000 port');
});
