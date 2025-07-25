
import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    position: { type: String, required: true },
    image: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

export default Candidate;
