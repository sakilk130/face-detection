const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'root',
    database: 'facedetection',
  },
});

app.use(express.json());
app.use(cors());

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.select('*').from('login').where('email', email);
    if (user.length === 0) {
      return res.status(400).json('error logging in');
    }
    const isMatchPassword = bcrypt.compare(password, user[0].hash);
    if (!isMatchPassword) {
      return res.status(400).json('error logging in');
    }
    const findUser = await db.select('*').from('users').where('email', email);
    return res.json(findUser[0]);
  } catch (error) {
    res.status(400).json('error logging in');
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.transaction(async (trx) => {
      const loginEmail = await trx('login').insert(
        {
          hash: hashedPassword,
          email: email,
        },
        'email'
      );
      const user = await trx('users')
        .insert({
          name,
          email: loginEmail[0],
          entries: 0,
          joined: new Date(),
        })
        .returning('*');
      return res.json(user[0]);
    });
  } catch (error) {
    res.status(400).json('unable to register');
  }
});

app.get('/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.select('*').from('users').where('id', id);
    if (user.length === 0) {
      return res.status(404).json('no such user');
    }
    res.json(user[0]);
  } catch (error) {
    return res.status(404).json('no such user');
  }
});

app.put('/image', async (req, res) => {
  const { id } = req.body;
  try {
    const entries = await db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries');

    res.json(entries[0]);
  } catch (error) {
    return res.status(400).json('unable to get entries');
  }
});

app.listen(5000, () => {
  console.log('server is running on 5000 port');
});
