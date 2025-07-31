import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';
import mongoose from 'mongoose';
import Election from '../models/electionModel.js';

export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    
    // Better user ID extraction
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    console.log('Vote request - User:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Election ID:', electionId);
    console.log('Candidate ID:', candidateId);

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

    // ENHANCED: Check for existing vote with proper ObjectId conversion
    const existingVote = await Vote.findOne({
      election: new mongoose.Types.ObjectId(electionId),
      voter: new mongoose.Types.ObjectId(userId),
      position: candidate.position
    });

    console.log('Existing vote check result:', existingVote);

    if (existingVote) {
      console.log('User has already voted for this position:', {
        userId,
        position: candidate.position,
        existingVoteId: existingVote._id
      });
      
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

    console.log('Creating new vote:', {
      election: newVote.election,
      candidate: newVote.candidate,
      voter: newVote.voter,
      position: newVote.position
    });

    // Save the vote first
    const savedVote = await newVote.save();
    console.log('Vote saved successfully with ID:', savedVote._id);

    // Update candidate vote count atomically
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    console.log('Candidate vote count updated:', {
      candidateId,
      newVoteCount: updatedCandidate.votes
    });

    // Populate the saved vote for response
    const populatedVote = await Vote.findById(savedVote._id)
      .populate('candidate', 'name position votes')
      .populate('election', 'title');

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      vote: {
        id: populatedVote._id,
        candidate: {
          id: populatedVote.candidate._id,
          name: populatedVote.candidate.name,
          position: populatedVote.candidate.position,
          votes: populatedVote.candidate.votes
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

    console.log('Getting user votes for:', {
      userId,
      electionId,
      position,
      userObject: req.user
    });

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

    // Build query with proper ObjectId conversion
    const query = {
      election: new mongoose.Types.ObjectId(electionId),
      voter: new mongoose.Types.ObjectId(userId)
    };

    if (position) {
      query.position = position;
    }

    console.log('Vote query:', query);

    const existingVotes = await Vote.find(query)
      .populate('candidate', 'name position image votes')
      .populate('election', 'title');

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
            candidateVotes: vote.candidate.votes,
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
            candidateVotes: vote.candidate.votes,
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

    console.log('Checking all votes for user:', userId, 'in election:', electionId);

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
    }).populate('candidate', 'name position image votes');

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
          candidateVotes: vote.candidate.votes,
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

// NEW: Get candidate vote count
export const getCandidateVoteCount = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate ID format'
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get real-time vote count from Vote collection
    const voteCount = await Vote.countDocuments({
      candidate: new mongoose.Types.ObjectId(candidateId)
    });

    // Update candidate's vote count if it's different
    if (candidate.votes !== voteCount) {
      await Candidate.findByIdAndUpdate(candidateId, { votes: voteCount });
    }

    res.status(200).json({
      success: true,
      candidateId,
      voteCount,
      candidateName: candidate.name,
      position: candidate.position
    });

  } catch (error) {
    console.error('Get candidate vote count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting candidate vote count',
      error: error.message
    });
  }
};

// NEW: Get admin statistics
export const getAdminStats = async (req, res) => {
  try {
    // Get total votes across all elections
    const totalVotes = await Vote.countDocuments();
    
    // Get votes by election
    const votesByElection = await Vote.aggregate([
      {
        $group: {
          _id: '$election',
          totalVotes: { $sum: 1 }
        }
      }
    ]);

    // Get votes by position
    const votesByPosition = await Vote.aggregate([
      {
        $group: {
          _id: '$position',
          totalVotes: { $sum: 1 }
        }
      }
    ]);

    // Get recent voting activity
    const recentVotes = await Vote.find()
      .populate('candidate', 'name position')
      .populate('election', 'title')
      .sort({ votedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalVotes,
        votesByElection,
        votesByPosition,
        recentVotes: recentVotes.map(vote => ({
          id: vote._id,
          candidateName: vote.candidate.name,
          position: vote.position,
          electionTitle: vote.election.title,
          votedAt: vote.votedAt
        }))
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting admin statistics',
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

    // Get candidates with real-time vote counts
    const candidates = await Candidate.find({ election: electionId })
      .sort({ position: 1, votes: -1 })
      .select('name position votes image');

    // Update candidates with real vote counts from Vote collection
    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
        // Update candidate's vote count if different
        if (candidate.votes !== realVoteCount) {
          await Candidate.findByIdAndUpdate(candidate._id, { votes: realVoteCount });
          candidate.votes = realVoteCount;
        }
        
        return candidate;
      })
    );

    const totalVotes = await Vote.countDocuments({ election: electionId });

    const positions = [...new Set(candidatesWithRealVotes.map(c => c.position))];
    
    const resultsByPosition = {};
    
    for (const position of positions) {
      const positionCandidates = candidatesWithRealVotes.filter(c => c.position === position);
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

    // Update candidates with real-time vote counts
    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
        // Update candidate's vote count if different
        if (candidate.votes !== realVoteCount) {
          await Candidate.findByIdAndUpdate(candidate._id, { votes: realVoteCount });
        }
        
        return {
          _id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          email: candidate.email,
          phone: candidate.phone,
          department: candidate.department,
          year: candidate.year,
          bio: candidate.bio,
          image: candidate.image,
          votes: realVoteCount
        };
      })
    );

    const positions = [...new Set(candidatesWithRealVotes.map(c => c.position))];
    
    const candidatesByPosition = {};
    
    positions.forEach(position => {
      candidatesByPosition[position] = candidatesWithRealVotes
        .filter(c => c.position === position);
    });

    res.status(200).json({
      success: true,
      positions: positions,
      candidatesByPosition: candidatesByPosition,
      candidates: candidatesWithRealVotes
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