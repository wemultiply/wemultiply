import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { dbConnection } from './database/connection.js';
import authRoutes from './routes/auth-route.js';
import memberRoutes from './routes/member-route.js';
import itemRoutes from './routes/item-route.js';
import userRoutes from './routes/user-route.js';
import paymongoRoutes from './routes/paymongo-route.js';
import transactionRoutes from './routes/transaction-route.js';
import goldensRoutes from './routes/golden-seats-route.js';
import path from 'path';

// Fix path calculation for Windows
const __dirname = path.dirname(new URL(import.meta.url).pathname).substring(1); // Remove leading slash

// Log the resolved path for uploads folder

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

dotenv.config();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Database connection
dbConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/user', userRoutes);
app.use('/api/paymongo', paymongoRoutes);
app.use('/api/trans', transactionRoutes);
app.use('/api/golden', goldensRoutes);

// Start server
app.listen(process.env.PORT || 3001, () => {
    console.log("Listening on port 3001");
});