import Candidate from '../models/candidateModel.js';
import Election from '../models/electionModel.js';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';


export const addCandidate = async (req, res) => {
  try {
    const { name, position, electionId } = req.body;

  
    if (!name || !position || !electionId) {
      return res.status(400).json({ 
        message: 'Name, position, and electionId are required' 
      });
    }

   
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: 'Invalid election ID format' });
    }

   
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

  
    let imageUrl = '';
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'candidates',
              transformation: [
                { width: 400, height: 400, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          message: 'Error uploading image',
          error: cloudinaryError.message
        });
      }
    }

    
    const newCandidate = new Candidate({
      name: name.trim(),
      position: position.trim(),
      election: electionId,
      image: imageUrl
    });

    await newCandidate.save();

    res.status(201).json({
      message: 'Candidate added successfully',
      candidate: newCandidate
    });

  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({
      message: 'Error adding candidate',
      error: error.message
    });
  }
};


export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: 'Invalid election ID format' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ election: electionId })
      .select('name position image election createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};
