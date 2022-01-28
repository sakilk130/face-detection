import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcryptjs';
import Clarifai from 'clarifai';

const app: Application = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  },
});

const appClarifai: any = new Clarifai.App({
  apiKey: process.env.API_KEY,
});

app.use(express.json());
app.use(cors());

export interface Login {
  id: number;
  hash: string;
  email: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  entries: string;
  joined: Date;
}

app.post('/signin', async (req: Request, res: Response): Promise<any> => {
  const { email, password }: { email: string; password: string } = req.body;
  try {
    const user: Login[] = await db
      .select('*')
      .from('login')
      .where('email', email);

    if (user.length === 0) {
      return res.status(400).json('error logging in');
    }
    const isMatchPassword: Promise<boolean> = bcrypt.compare(
      password,
      user[0].hash
    );
    if (!isMatchPassword) {
      return res.status(400).json('error logging in');
    }
    const findUser: User[] = await db
      .select('*')
      .from('users')
      .where('email', email);
    return res.json(findUser[0]);
  } catch (error) {
    res.status(400).json('error logging in');
  }
});

app.post('/register', async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    email,
    password,
  }: { name: string; email: string; password: string } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  try {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    await db.transaction(async (trx) => {
      const loginEmail: string[] = await trx('login').insert(
        {
          hash: hashedPassword,
          email: email,
        },
        'email'
      );
      const user: User[] = await trx('users')
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

app.get('/profile/:id', async (req: Request, res: Response): Promise<any> => {
  const id: number = Number(req.params.id);
  try {
    const user: User[] = await db.select('*').from('users').where('id', id);
    if (user.length === 0) {
      return res.status(404).json('no such user');
    }
    res.json(user[0]);
  } catch (error) {
    return res.status(404).json('no such user');
  }
});

app.post('/imageurl', async (req: Request, res: Response): Promise<any> => {
  const { input }: { input: string } = req.body;
  try {
    const data: any = await appClarifai.models.predict(
      'a403429f2ddf4b49b307e318f00e528b',
      input
    );
    res.json(data);
  } catch (error) {
    res.status(400).json('unable to work with API');
  }
});

app.put('/image', async (req: Request, res: Response): Promise<any> => {
  const { id }: { id: number } = req.body;
  try {
    const entries: string[] = await db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries');
    res.json(entries[0]);
  } catch (error) {
    return res.status(400).json('unable to get entries');
  }
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT} port`);
});
