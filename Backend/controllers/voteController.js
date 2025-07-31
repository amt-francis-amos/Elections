import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';
import mongoose from 'mongoose';
import Election from '../models/electionModel.js';

export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    
    // Better user ID extraction
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    console.log('User object:', req.user);
    console.log('Extracted userId:', userId);

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found. Please log in again.'
      });
    }

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

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
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

    // ENHANCED: Check for existing vote with better error handling
    const existingVote = await Vote.findOne({
      election: new mongoose.Types.ObjectId(electionId),
      voter: new mongoose.Types.ObjectId(userId),
      position: candidate.position
    });

    if (existingVote) {
      console.log('Existing vote found for user:', userId, 'position:', candidate.position);
      return res.status(400).json({
        success: false,
        message: `You have already voted for the ${candidate.position} position in this election`,
        alreadyVoted: true,
        votedFor: existingVote.candidate,
        position: candidate.position,
        votedAt: existingVote.votedAt
      });
    }

    // Create new vote with proper ObjectId conversion
    const newVote = new Vote({
      election: new mongoose.Types.ObjectId(electionId),
      candidate: new mongoose.Types.ObjectId(candidateId),
      voter: new mongoose.Types.ObjectId(userId),
      position: candidate.position,
      votedAt: new Date()
    });

    console.log('Attempting to save vote:', {
      election: newVote.election,
      candidate: newVote.candidate,
      voter: newVote.voter,
      position: newVote.position
    });

    await newVote.save();
    console.log('Vote successfully saved with ID:', newVote._id);

    // Update candidate vote count
    await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    // Populate the saved vote
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
        position: populatedVote.position,
        votedAt: populatedVote.votedAt
      }
    });

  } catch (error) {
    console.error('Cast vote error:', error);
    
    // Handle specific duplicate key error
    if (error.code === 11000) {
      // Extract position from error if possible
      const position = error.keyValue?.position || 'this position';
      return res.status(400).json({
        success: false,
        message: `You have already voted for ${position} in this election`,
        alreadyVoted: true,
        position: position
      });
    }
    
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
    const { position } = req.query;
    
    // Better user ID extraction
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    console.log('Getting user votes for userId:', userId, 'electionId:', electionId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found. Please log in again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    const query = {
      election: new mongoose.Types.ObjectId(electionId),
      voter: new mongoose.Types.ObjectId(userId)
    };

    if (position) {
      query.position = position;
    }

    console.log('Vote query:', query);

    const existingVotes = await Vote.find(query).populate('candidate', 'name position image');

    console.log('Found votes:', existingVotes.length);

    if (existingVotes.length > 0) {
      if (position) {
        // Single position query
        const vote = existingVotes[0];
        return res.status(200).json({
          success: true,
          hasVoted: true,
          vote: {
            candidate: vote.candidate._id,
            candidateName: vote.candidate.name,
            candidatePosition: vote.candidate.position,
            candidateImage: vote.candidate.image,
            position: vote.position,
            votedAt: vote.votedAt
          }
        });
      } else {
        // Multiple positions query
        return res.status(200).json({
          success: true,
          hasVoted: true,
          votes: existingVotes.map(vote => ({
            candidate: vote.candidate._id,
            candidateName: vote.candidate.name,
            candidatePosition: vote.candidate.position,
            candidateImage: vote.candidate.image,
            position: vote.position,
            votedAt: vote.votedAt
          }))
        });
      }
    } else {
      // No votes found - return structured response
      return res.status(200).json({
        success: true,
        hasVoted: false,
        votes: [],
        message: 'No votes found for this user in this election'
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

// ENHANCED: Add a dedicated endpoint for checking all user votes in an election
export const checkUserVotesInElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    console.log('Checking all votes for userId:', userId, 'in election:', electionId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found. Please log in again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(electionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const votes = await Vote.find({
      election: new mongoose.Types.ObjectId(electionId),
      voter: new mongoose.Types.ObjectId(userId)
    }).populate('candidate', 'name position image');

    console.log('Found total votes for user:', votes.length);

    if (votes.length > 0) {
      const votedPositions = votes.map(vote => vote.position);
      const votedCandidates = {};
      
      votes.forEach(vote => {
        votedCandidates[vote.position] = vote.candidate._id;
      });

      return res.status(200).json({
        success: true,
        hasVoted: true,
        totalVotes: votes.length,
        votedPositions,
        votedCandidates,
        votes: votes.map(vote => ({
          candidate: vote.candidate._id,
          candidateName: vote.candidate.name,
          position: vote.position,
          votedAt: vote.votedAt
        }))
      });
    } else {
      return res.status(200).json({
        success: true,
        hasVoted: false,
        totalVotes: 0,
        votedPositions: [],
        votedCandidates: {},
        votes: []
      });
    }

  } catch (error) {
    console.error('Check user votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user votes',
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
      .sort({ position: 1, votes: -1 })
      .select('name position votes image');

    const totalVotes = await Vote.countDocuments({ election: electionId });

    const positions = [...new Set(candidates.map(c => c.position))];
    
    const resultsByPosition = {};
    
    for (const position of positions) {
      const positionCandidates = candidates.filter(c => c.position === position);
      const positionTotalVotes = await Vote.countDocuments({ 
        election: electionId, 
        position: position 
      });
      
      resultsByPosition[position] = {
        totalVotes: positionTotalVotes,
        candidates: positionCandidates.map(candidate => ({
          ...candidate.toObject(),
          percentage: positionTotalVotes > 0 ? 
            ((candidate.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0
        }))
      };
    }

    res.status(200).json({
      success: true,
      election: {
        id: election._id,
        title: election.title,
        description: election.description
      },
      results: {
        totalVotes,
        positions: resultsByPosition
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
      .sort({ position: 1, createdAt: -1 });

    const positions = [...new Set(candidates.map(c => c.position))];
    
    const candidatesByPosition = {};
    
    positions.forEach(position => {
      candidatesByPosition[position] = candidates
        .filter(c => c.position === position)
        .map(candidate => ({
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
        }));
    });

    res.status(200).json({
      success: true,
      positions: positions,
      candidatesByPosition: candidatesByPosition,
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