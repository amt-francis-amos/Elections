import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    position: { type: String, required: true, trim: true },
    image: { type: String, default: '' }, 
    votes: { type: Number, default: 0 },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    year: { type: String, trim: true },
    bio: { type: String, trim: true }
  },
  { timestamps: true }
);

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

export default Candidate;
