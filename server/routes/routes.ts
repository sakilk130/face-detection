import dotenv from 'dotenv';
import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Clarifai from 'clarifai';
import db from '../config/db';

dotenv.config();
const router: Router = express.Router();

const appClarifai: any = new Clarifai.App({
  apiKey: process.env.API_KEY,
});

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

router.post('/signin', async (req: Request, res: Response): Promise<any> => {
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

router.post('/register', async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    email,
    password,
  }: { name: string; email: string; password: string } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  try {
    const hashedPassword: string = await bcrypt.hash(
      password,
      Number(process.env.PASSWORD_SALT)
    );
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

router.get(
  '/profile/:id',
  async (req: Request, res: Response): Promise<any> => {
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
  }
);

router.post('/imageurl', async (req: Request, res: Response): Promise<any> => {
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

router.put('/image', async (req: Request, res: Response): Promise<any> => {
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

export default router;
