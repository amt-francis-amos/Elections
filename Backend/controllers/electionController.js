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
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching elections", error });
  }
};