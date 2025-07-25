import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js'
import connectDb from './config/mongoDB.js';
const app = express();

const PORT = process.env.PORT || 5000;

connectDb();


 app.use(cors({credentials:true}));
 app.use(express.json());

app.use('/api/users', userRoutes)







app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`)
})