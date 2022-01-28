import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes/routes';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT} port`);
});
