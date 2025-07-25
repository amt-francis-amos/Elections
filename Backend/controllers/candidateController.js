
import Candidate from '../models/candidateModel.js';
import Election from '../models/electionModel.js';
import cloudinary from '../config/cloudinary.js';

export const addCandidate = async (req, res) => {
  try {
    const { name, position, electionId } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'candidates' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const newCandidate = new Candidate({ name, position, election: electionId, image: imageUrl });
    await newCandidate.save();

    res.status(201).json({ message: 'Candidate added', candidate: newCandidate });
  } catch (error) {
    res.status(500).json({ message: 'Error adding candidate', error: error.message });
  }
};

export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.find({ election: electionId });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates', error });
  }
};
