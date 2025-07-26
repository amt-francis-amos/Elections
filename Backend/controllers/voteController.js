
import Vote from '../models/VotingModel.js';
import Candidate from '../models/candidateModel.js';

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
    res.status(500).json({ message: 'Error fetching results', error });
  }
};
