
import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';
import mongoose from 'mongoose';


export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

  
    const existingVote = await Vote.findOne({ user: req.user._id, election: electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    const vote = new Vote({
      user: req.user._id,
      election: electionId,
      candidate: candidateId,
    });

    await vote.save();

    res.status(201).json({ message: 'Vote cast successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error casting vote', error });
  }
};

export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }

    const votes = await Vote.aggregate([
      { $match: { election: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidate', voteCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'candidates', 
          localField: '_id',
          foreignField: '_id',
          as: 'candidateInfo',
        },
      },
      { $unwind: '$candidateInfo' },
      {
        $project: {
          candidateName: '$candidateInfo.name',
          voteCount: 1,
        },
      },
      { $sort: { voteCount: -1 } },
    ]);

    res.json(votes);
  } catch (error) {
    console.error('❌ Error in getResults:', error);
    res.status(500).json({ message: 'Error fetching results', error });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Validate election ID
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }


    const candidates = await Candidate.find({ 
      election: new mongoose.Types.ObjectId(electionId),
      
    }).select('name party description profileImage'); 

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: 'No candidates found for this election' });
    }

    res.json({
      success: true,
      candidates,
      count: candidates.length
    });

  } catch (error) {
    console.error('❌ Error in getCandidates:', error);
    res.status(500).json({ message: 'Error fetching candidates', error });
  }
};