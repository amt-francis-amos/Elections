import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';
import mongoose from 'mongoose';
import Election from '../models/electionModel.js';

export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user.id || req.user._id;


    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators are not allowed to vote in elections'
      });
    }

    if (!electionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID and Candidate ID are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(electionId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election or candidate ID format'
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (!election.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Election is not currently active'
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (candidate.election.toString() !== electionId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate does not belong to this election'
      });
    }

    const existingVote = await Vote.findOne({
      election: electionId,
      voter: userId
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election',
        alreadyVoted: true,
        votedFor: existingVote.candidate
      });
    }

    const newVote = new Vote({
      election: electionId,
      candidate: candidateId,
      voter: userId,
      votedAt: new Date()
    });

    await newVote.save();

    await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    const populatedVote = await Vote.findById(newVote._id)
      .populate('candidate', 'name position')
      .populate('election', 'title');

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      vote: {
        id: populatedVote._id,
        candidate: {
          id: populatedVote.candidate._id,
          name: populatedVote.candidate.name,
          position: populatedVote.candidate.position
        },
        election: {
          id: populatedVote.election._id,
          title: populatedVote.election.title
        },
        votedAt: populatedVote.votedAt
      }
    });

  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error casting vote',
      error: error.message
    });
  }
};

export const getUserVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    const existingVote = await Vote.findOne({
      election: electionId,
      voter: userId
    }).populate('candidate', 'name position image');

    if (existingVote) {
      return res.status(200).json({
        success: true,
        hasVoted: true,
        vote: {
          candidate: existingVote.candidate._id,
          candidateName: existingVote.candidate.name,
          candidatePosition: existingVote.candidate.position,
          candidateImage: existingVote.candidate.image,
          votedAt: existingVote.votedAt
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

export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    const candidates = await Candidate.find({ election: electionId })
      .sort({ votes: -1 }) 
      .select('name position votes image');

    const totalVotes = await Vote.countDocuments({ election: electionId });

    const candidatesWithPercentage = candidates.map(candidate => ({
      ...candidate.toObject(),
      percentage: totalVotes > 0 ? ((candidate.votes || 0) / totalVotes * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      election: {
        id: election._id,
        title: election.title,
        description: election.description
      },
      results: {
        totalVotes,
        candidates: candidatesWithPercentage
      }
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (!election.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Election is not currently active'
      });
    }

    const candidates = await Candidate.find({ election: electionId })
      .select('name position email phone department year bio image votes')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      candidates: candidates.map(candidate => ({
        _id: candidate._id,
        name: candidate.name,
        position: candidate.position,
        email: candidate.email,
        phone: candidate.phone,
        department: candidate.department,
        year: candidate.year,
        bio: candidate.bio,
        image: candidate.image,
        votes: candidate.votes || 0
      }))
    });

  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};