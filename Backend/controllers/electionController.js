import Election from '../models/electionModel.js';

export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

   
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

  
    if (start <= now) {
      return res.status(400).json({ message: "Start date must be in the future" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after the start date" });
    }

    const newElection = new Election({
      title,
      description,
      startDate: start,
      endDate: end,
      createdBy: req.user._id,
    });

    await newElection.save();

    res.status(201).json({ message: "Election created", election: newElection });
  } catch (error) {
    console.error("Error creating election:", error);
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