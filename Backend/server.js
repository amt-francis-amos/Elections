import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';
import connectDb from './config/mongoDB.js';
import electionRoutes from './routes/electionRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDb();

app.use(helmet());
app.use(cors({credentials: true}));
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes); 
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('🎉 Voting System API is running!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});