import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express();

const PORT = process.env.PORT || 5000;


 app.use(cors({credential:true}));
 app.use(express.json());






app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`)
})