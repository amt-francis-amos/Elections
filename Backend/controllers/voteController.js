import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';
import mongoose from 'mongoose';
import Election from '../models/electionModel.js';
import User from '../models/userModel.js';

export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    
    console.log('Vote request - User:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Election ID:', electionId);
    console.log('Candidate ID:', candidateId);

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

    const savedVote = await newVote.save();
    console.log('Vote saved successfully with ID:', savedVote._id);

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    console.log('Candidate vote count updated:', {
      candidateId,
      newVoteCount: updatedCandidate.votes
    });

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
    
    if (error.code === 11000) {
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

    const voteCount = await Vote.countDocuments({
      candidate: new mongoose.Types.ObjectId(candidateId)
    });

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

export const getAdminStats = async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    
    const votesByElection = await Vote.aggregate([
      {
        $group: {
          _id: '$election',
          totalVotes: { $sum: 1 }
        }
      }
    ]);

    const votesByPosition = await Vote.aggregate([
      {
        $group: {
          _id: '$position',
          totalVotes: { $sum: 1 }
        }
      }
    ]);

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

    const candidates = await Candidate.find({ election: electionId })
      .sort({ position: 1, votes: -1 })
      .select('name position votes image');

    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
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

    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
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

export const getFinalResults = async (req, res) => {
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
      .select('name position votes image email department');

    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
        if (candidate.votes !== realVoteCount) {
          await Candidate.findByIdAndUpdate(candidate._id, { votes: realVoteCount });
          candidate.votes = realVoteCount;
        }
        
        return candidate;
      })
    );

    const totalVotes = await Vote.countDocuments({ election: electionId });
    const totalVoters = await Vote.distinct('voter', { election: electionId });
    const uniqueVotersCount = totalVoters.length;

    const positions = [...new Set(candidatesWithRealVotes.map(c => c.position))];
    
    const finalResults = {};
    const winners = {};
    
    for (const position of positions) {
      const positionCandidates = candidatesWithRealVotes
        .filter(c => c.position === position)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      const positionTotalVotes = await Vote.countDocuments({ 
        election: electionId, 
        position: position 
      });
      
      const winner = positionCandidates[0];
      const isTie = positionCandidates.length > 1 && 
                   positionCandidates[0].votes === positionCandidates[1].votes &&
                   positionCandidates[0].votes > 0;
      
      finalResults[position] = {
        totalVotes: positionTotalVotes,
        winner: winner ? {
          id: winner._id,
          name: winner.name,
          votes: winner.votes,
          percentage: positionTotalVotes > 0 ? 
            ((winner.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0,
          email: winner.email,
          department: winner.department
        } : null,
        isTie: isTie,
        tiedCandidates: isTie ? positionCandidates
          .filter(c => c.votes === winner.votes)
          .map(c => ({
            id: c._id,
            name: c.name,
            votes: c.votes,
            percentage: positionTotalVotes > 0 ? 
              ((c.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0
          })) : [],
        allCandidates: positionCandidates.map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          votes: candidate.votes || 0,
          percentage: positionTotalVotes > 0 ? 
            ((candidate.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0,
          email: candidate.email,
          department: candidate.department
        }))
      };
      
      if (winner && !isTie) {
        winners[position] = {
          id: winner._id,
          name: winner.name,
          votes: winner.votes,
          percentage: finalResults[position].winner.percentage
        };
      }
    }

    const turnoutRate = election.eligibleVoters > 0 ? 
      ((uniqueVotersCount / election.eligibleVoters) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: election.status,
        eligibleVoters: election.eligibleVoters
      },
      summary: {
        totalVotes,
        uniqueVoters: uniqueVotersCount,
        turnoutRate: parseFloat(turnoutRate),
        positionsCount: positions.length,
        winnersCount: Object.keys(winners).length,
        tiedPositions: Object.values(finalResults).filter(r => r.isTie).length
      },
      winners,
      results: finalResults,
      exportedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get final results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching final results',
      error: error.message
    });
  }
};

export const exportElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { format = 'json' } = req.query;

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
      .select('name position votes image email phone department year');

    const votes = await Vote.find({ election: electionId })
      .populate('candidate', 'name position')
      .populate('voter', 'name email userId')
      .sort({ votedAt: 1 });

    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
        if (candidate.votes !== realVoteCount) {
          await Candidate.findByIdAndUpdate(candidate._id, { votes: realVoteCount });
          candidate.votes = realVoteCount;
        }
        
        return candidate;
      })
    );

    const totalVotes = votes.length;
    const totalVoters = await Vote.distinct('voter', { election: electionId });
    const uniqueVotersCount = totalVoters.length;

    const positions = [...new Set(candidatesWithRealVotes.map(c => c.position))];
    
    const finalResults = {};
    const winners = {};
    const detailedResults = {};
    
    for (const position of positions) {
      const positionCandidates = candidatesWithRealVotes
        .filter(c => c.position === position)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      const positionVotes = votes.filter(v => v.candidate.position === position);
      const positionTotalVotes = positionVotes.length;
      
      const winner = positionCandidates[0];
      const isTie = positionCandidates.length > 1 && 
                   positionCandidates[0].votes === positionCandidates[1].votes &&
                   positionCandidates[0].votes > 0;
      
      finalResults[position] = {
        totalVotes: positionTotalVotes,
        winner: winner ? {
          id: winner._id,
          name: winner.name,
          votes: winner.votes,
          percentage: positionTotalVotes > 0 ? 
            ((winner.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0,
          email: winner.email,
          phone: winner.phone,
          department: winner.department,
          year: winner.year
        } : null,
        isTie: isTie,
        candidates: positionCandidates.map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          votes: candidate.votes || 0,
          percentage: positionTotalVotes > 0 ? 
            ((candidate.votes || 0) / positionTotalVotes * 100).toFixed(2) : 0,
          email: candidate.email,
          phone: candidate.phone,
          department: candidate.department,
          year: candidate.year,
          isWinner: candidate._id.toString() === winner?._id.toString() && !isTie
        }))
      };
      
      detailedResults[position] = {
        ...finalResults[position],
        votingPattern: positionVotes.map(vote => ({
          voteId: vote._id,
          candidateName: vote.candidate.name,
          voterName: vote.voter.name,
          voterEmail: vote.voter.email,
          voterUserId: vote.voter.userId,
          votedAt: vote.votedAt
        }))
      };
      
      if (winner && !isTie) {
        winners[position] = {
          id: winner._id,
          name: winner.name,
          votes: winner.votes,
          percentage: finalResults[position].winner.percentage,
          email: winner.email,
          department: winner.department
        };
      }
    }

    const turnoutRate = election.eligibleVoters > 0 ? 
      ((uniqueVotersCount / election.eligibleVoters) * 100).toFixed(2) : 0;

    const exportData = {
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: election.status,
        eligibleVoters: election.eligibleVoters,
        isActive: election.isActive
      },
      summary: {
        totalVotes,
        uniqueVoters: uniqueVotersCount,
        turnoutRate: parseFloat(turnoutRate),
        positionsCount: positions.length,
        candidatesCount: candidatesWithRealVotes.length,
        winnersCount: Object.keys(winners).length,
        tiedPositions: Object.values(finalResults).filter(r => r.isTie).length
      },
      winners,
      results: finalResults,
      detailedResults: req.user?.role === 'admin' ? detailedResults : undefined,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user?.name || 'System',
        exportFormat: format,
        dataIntegrity: {
          candidatesVerified: candidatesWithRealVotes.length,
          votesVerified: totalVotes,
          votersVerified: uniqueVotersCount
        }
      }
    };

    if (format === 'csv') {
      let csvContent = '';
      
      csvContent += 'Election Results Export\n';
      csvContent += `Election: ${election.title}\n`;
      csvContent += `Exported: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Votes: ${totalVotes}\n`;
      csvContent += `Unique Voters: ${uniqueVotersCount}\n`;
      csvContent += `Turnout Rate: ${turnoutRate}%\n\n`;
      
      csvContent += 'WINNERS SUMMARY\n';
      csvContent += 'Position,Winner Name,Votes,Percentage,Email,Department\n';
      
      Object.entries(winners).forEach(([position, winner]) => {
        csvContent += `"${position}","${winner.name}",${winner.votes},${winner.percentage}%,"${finalResults[position].winner.email || ''}","${finalResults[position].winner.department || ''}"\n`;
      });
      
      csvContent += '\nDETAILED RESULTS BY POSITION\n';
      
      Object.entries(finalResults).forEach(([position, result]) => {
        csvContent += `\n"${position.toUpperCase()} RESULTS"\n`;
        csvContent += 'Rank,Candidate Name,Votes,Percentage,Email,Department,Status\n';
        
        result.candidates.forEach((candidate, index) => {
          const status = candidate.isWinner ? 'WINNER' : 
                        result.isTie && index === 0 ? 'TIED' : 'RUNNER-UP';
          csvContent += `${index + 1},"${candidate.name}",${candidate.votes},${candidate.percentage}%,"${candidate.email || ''}","${candidate.department || ''}","${status}"\n`;
        });
      });
      
      if (req.user?.role === 'admin') {
        csvContent += '\nVOTING DETAILS (ADMIN ONLY)\n';
        csvContent += 'Position,Candidate,Voter Name,Voter Email,Voter ID,Vote Time\n';
        
        Object.entries(detailedResults).forEach(([position, result]) => {
          result.votingPattern.forEach(vote => {
            csvContent += `"${position}","${vote.candidateName}","${vote.voterName}","${vote.voterEmail}","${vote.voterUserId}","${new Date(vote.votedAt).toLocaleString()}"\n`;
          });
        });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${election.title.replace(/[^a-zA-Z0-9]/g, '_')}_results.csv"`);
      return res.send(csvContent);
    }
    
    if (format === 'txt') {
      let txtContent = '';
      
      txtContent += '='.repeat(60) + '\n';
      txtContent += `OFFICIAL ELECTION RESULTS\n`;
      txtContent += '='.repeat(60) + '\n';
      txtContent += `Election: ${election.title}\n`;
      txtContent += `Description: ${election.description || 'N/A'}\n`;
      txtContent += `Period: ${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}\n`;
      txtContent += `Status: ${election.status.toUpperCase()}\n`;
      txtContent += `Exported: ${new Date().toLocaleString()}\n`;
      txtContent += '='.repeat(60) + '\n\n';
      
      txtContent += 'ELECTION SUMMARY\n';
      txtContent += '-'.repeat(30) + '\n';
      txtContent += `Total Votes Cast: ${totalVotes}\n`;
      txtContent += `Unique Voters: ${uniqueVotersCount}\n`;
      txtContent += `Eligible Voters: ${election.eligibleVoters || 'N/A'}\n`;
      txtContent += `Voter Turnout: ${turnoutRate}%\n`;
      txtContent += `Positions Contested: ${positions.length}\n`;
      txtContent += `Total Candidates: ${candidatesWithRealVotes.length}\n\n`;
      
      txtContent += 'DECLARED WINNERS\n';
      txtContent += '-'.repeat(30) + '\n';
      
      if (Object.keys(winners).length === 0) {
        txtContent += 'No clear winners due to ties or no votes cast.\n\n';
      } else {
        Object.entries(winners).forEach(([position, winner]) => {
          txtContent += `${position.toUpperCase()}: ${winner.name}\n`;
          txtContent += `  Votes: ${winner.votes} (${winner.percentage}%)\n`;
          if (finalResults[position].winner.email) {
            txtContent += `  Email: ${finalResults[position].winner.email}\n`;
          }
          if (finalResults[position].winner.department) {
            txtContent += `  Department: ${finalResults[position].winner.department}\n`;
          }
          txtContent += '\n';
        });
      }
      
      const tiedPositions = Object.entries(finalResults).filter(([, result]) => result.isTie);
      if (tiedPositions.length > 0) {
        txtContent += 'TIED POSITIONS (REQUIRING RECOUNT/RUNOFF)\n';
        txtContent += '-'.repeat(45) + '\n';
        
        tiedPositions.forEach(([position, result]) => {
          txtContent += `${position.toUpperCase()}:\n`;
          const tiedCandidates = result.candidates.filter(c => c.votes === result.candidates[0].votes);
          tiedCandidates.forEach(candidate => {
            txtContent += `  - ${candidate.name}: ${candidate.votes} votes (${candidate.percentage}%)\n`;
          });
          txtContent += '\n';
        });
      }
      
      txtContent += 'DETAILED RESULTS BY POSITION\n';
      txtContent += '='.repeat(60) + '\n';
      
      Object.entries(finalResults).forEach(([position, result]) => {
        txtContent += `\n${position.toUpperCase()}\n`;
        txtContent += '-'.repeat(position.length + 5) + '\n';
        txtContent += `Total Votes for this position: ${result.totalVotes}\n\n`;
        
        result.candidates.forEach((candidate, index) => {
          const rank = index + 1;
          const status = candidate.isWinner ? ' (WINNER)' : 
                        result.isTie && candidate.votes === result.candidates[0].votes ? ' (TIED)' : '';
          
          txtContent += `${rank}. ${candidate.name}${status}\n`;
          txtContent += `   Votes: ${candidate.votes} (${candidate.percentage}%)\n`;
          if (candidate.email) txtContent += `   Email: ${candidate.email}\n`;
          if (candidate.department) txtContent += `   Department: ${candidate.department}\n`;
          if (candidate.year) txtContent += `   Year: ${candidate.year}\n`;
          txtContent += '\n';
        });
      });
      
      txtContent += '='.repeat(60) + '\n';
      txtContent += 'END OF OFFICIAL RESULTS\n';
      txtContent += '='.repeat(60) + '\n';
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${election.title.replace(/[^a-zA-Z0-9]/g, '_')}_results.txt"`);
      return res.send(txtContent);
    }
    
    res.setHeader('Content-Type', 'application/json');
    if (format === 'download') {
      res.setHeader('Content-Disposition', `attachment; filename="${election.title.replace(/[^a-zA-Z0-9]/g, '_')}_results.json"`);
    }
    
    res.status(200).json(exportData);

  } catch (error) {
    console.error('Export election results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting election results',
      error: error.message
    });
  }
};

export const declareWinners = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { confirmDeclaration = false } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can declare winners'
      });
    }

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
      .select('name position votes email department');

    const candidatesWithRealVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const realVoteCount = await Vote.countDocuments({
          candidate: candidate._id
        });
        
        if (candidate.votes !== realVoteCount) {
          await Candidate.findByIdAndUpdate(candidate._id, { votes: realVoteCount });
          candidate.votes = realVoteCount;
        }
        
        return candidate;
      })
    );

    const positions = [...new Set(candidatesWithRealVotes.map(c => c.position))];
    const winners = {};
    const ties = {};
    const warnings = [];

    for (const position of positions) {
      const positionCandidates = candidatesWithRealVotes
        .filter(c => c.position === position)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));
      
      const positionTotalVotes = await Vote.countDocuments({ 
        election: electionId, 
        position: position 
      });
      
      if (positionCandidates.length === 0) {
        warnings.push(`No candidates found for position: ${position}`);
        continue;
      }

      const topCandidate = positionCandidates[0];
      
      if (topCandidate.votes === 0) {
        warnings.push(`No votes cast for position: ${position}`);
        continue;
      }

      const isTie = positionCandidates.length > 1 && 
                   positionCandidates[0].votes === positionCandidates[1].votes;
      
      if (isTie) {
        const tiedCandidates = positionCandidates.filter(c => c.votes === topCandidate.votes);
        ties[position] = {
          candidates: tiedCandidates.map(c => ({
            id: c._id,
            name: c.name,
            votes: c.votes,
            percentage: positionTotalVotes > 0 ? 
              ((c.votes / positionTotalVotes) * 100).toFixed(2) : 0
          })),
          voteCount: topCandidate.votes,
          requiresRunoff: true
        };
        warnings.push(`Tie detected for position ${position}: ${tiedCandidates.length} candidates with ${topCandidate.votes} votes each`);
      } else {
        winners[position] = {
          id: topCandidate._id,
          name: topCandidate.name,
          votes: topCandidate.votes,
          percentage: positionTotalVotes > 0 ? 
            ((topCandidate.votes / positionTotalVotes) * 100).toFixed(2) : 0,
          email: topCandidate.email,
          department: topCandidate.department,
          declaredAt: new Date(),
          declaredBy: req.user.name || req.user.email
        };
      }
    }

    if (!confirmDeclaration && (Object.keys(ties).length > 0 || warnings.length > 0)) {
      return res.status(200).json({
        success: true,
        requiresConfirmation: true,
        message: 'Issues detected that require confirmation before declaring winners',
        winners,
        ties,
        warnings,
        summary: {
          clearWinners: Object.keys(winners).length,
          tiedPositions: Object.keys(ties).length,
          warningsCount: warnings.length,
          totalPositions: positions.length
        }
      });
    }

    if (confirmDeclaration || (Object.keys(ties).length === 0 && warnings.length === 0)) {
      await Election.findByIdAndUpdate(electionId, {
        winnersDecla红: true,
        winnersData: winners,
        tiesData: ties,
        declarationDate: new Date(),
        declarationBy: req.user._id,
        status: 'completed'
      });

      res.status(200).json({
        success: true,
        message: 'Winners successfully declared',
        declared: true,
        winners,
        ties,
        warnings,
        declaration: {
          declaredAt: new Date(),
          declaredBy: req.user.name || req.user.email,
          electionId: electionId,
          electionTitle: election.title
        },
        summary: {
          clearWinners: Object.keys(winners).length,
          tiedPositions: Object.keys(ties).length,
          warningsCount: warnings.length,
          totalPositions: positions.length
        }
      });
    }

  } catch (error) {
    console.error('Declare winners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declaring winners',
      error: error.message
    });
  }
};

export const getWinnersDeclaration = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }

    const election = await Election.findById(electionId)
      .populate('declarationBy', 'name email');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (!election.winnersDeclaration) {
      return res.status(200).json({
        success: true,
        declared: false,
        message: 'Winners have not been declared for this election yet'
      });
    }

    res.status(200).json({
      success: true,
      declared: true,
      election: {
        id: election._id,
        title: election.title,
        description: election.description
      },
      winners: election.winnersData || {},
      ties: election.tiesData || {},
      declaration: {
        declaredAt: election.declarationDate,
        declaredBy: election.declarationBy?.name || 'System',
        declarationByEmail: election.declarationBy?.email
      }
    });

  } catch (error) {
    console.error('Get winners declaration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching winners declaration',
      error: error.message
    });
  }
};