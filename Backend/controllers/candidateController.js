import Candidate from '../models/candidateModel.js';
import Election from '../models/electionModel.js';

export const addCandidate = async (req, res) => {
  try {
    const { name, position, image, electionId } = req.body;

   
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    
    const newCandidate = new Candidate({
      name,
      position,
      image,
      election: electionId
    });

    await newCandidate.save();

    res.status(201).json({ message: "Candidate added", candidate: newCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error adding candidate", error });
  }
};

export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.find({ election: electionId });

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};
