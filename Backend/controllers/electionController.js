import Election from '../models/electionModel.js';

export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id,
    });

    await newElection.save();
    res.status(201).json({ message: "Election created", election: newElection });
  } catch (error) {
    res.status(500).json({ message: "Error creating election", error });
  }
};

export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });

    const enrichedElections = await Promise.all(
      elections.map(async (election) => {
        const candidatesCount = await Candidate.countDocuments({ election: election._id });

     
        const totalVotes = 0;

        return {
          ...election.toObject(),
          candidatesCount,
          totalVotes
        };
      })
    );

    res.json(enrichedElections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Error fetching elections", error });
  }
};