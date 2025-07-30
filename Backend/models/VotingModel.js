import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

voteSchema.index({ election: 1, voter: 1, position: 1 }, { unique: true });

voteSchema.index({ election: 1 });
voteSchema.index({ candidate: 1 });
voteSchema.index({ voter: 1 });
voteSchema.index({ position: 1 });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;