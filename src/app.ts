// src/app.ts - Express application setup
import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', router);

export default app;
