const express = require('express');
const cors = require('cors');

const app = express();
const { users } = require('./db/db');

app.use(express.json());
app.use(cors());
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

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  users.map((user) => {
    if (user.id === id) {
      return res.json(user);
    } else {
      return res.status(404).json('no such user');
    }
  });
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  let find = false;

  users.map((user) => {
    if (user.id == id) {
      user.entries++;
      find = true;
      return res.json(user.entries);
    }
  });

  if (!find) {
    return res.status(400).json('not found');
  }
});

app.listen(5000, () => {
  console.log('server is running on 5000 port');
});
