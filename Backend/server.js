import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js'
import connectDB from './config/mongoDB.js';
const app = express();

const PORT = process.env.PORT || 5000;
connectDB
// API routes
app.use('/api/users', userRoutes)

 app.use(cors({credential:true}));
 app.use(express.json());






app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`)
})