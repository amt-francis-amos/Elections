
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



export const getUserVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id || req.user._id; // Get user ID from auth middleware

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Find if user has already voted in this election
    const existingVote = await Vote.findOne({
      election: electionId,
      voter: userId
    }).populate('candidate', 'name position');

    if (existingVote) {
      return res.status(200).json({
        success: true,
        hasVoted: true,
        vote: {
          candidate: existingVote.candidate._id,
          candidateName: existingVote.candidate.name,
          candidatePosition: existingVote.candidate.position,
          votedAt: existingVote.createdAt
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        hasVoted: false,
        message: 'No vote found for this user in this election'
      });
    }

  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user vote',
      error: error.message
    });
  }
};