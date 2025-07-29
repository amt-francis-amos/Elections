import Candidate from '../models/candidateModel.js';
import Election from '../models/electionModel.js';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
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
    stream.end(fileBuffer);
  });
};

export const addCandidate = async (req, res) => {
  try {
    const { name, position, electionId, email, phone, department, year, bio } = req.body;

    if (!name || !position || !electionId) {
      return res.status(400).json({ success: false, message: 'Name, position, and electionId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ success: false, message: 'Invalid election ID format' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    let imageUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (cloudinaryError) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading image',
          error: cloudinaryError.message
        });
      }
    }

    const candidateData = {
      name: name.trim(),
      position: position.trim(),
      election: electionId,
      image: imageUrl,
      ...(email && { email: email.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(department && { department: department.trim() }),
      ...(year && { year: year.trim() }),
      ...(bio && { bio: bio.trim() }),
    };

    const newCandidate = new Candidate(candidateData);
    await newCandidate.save();

    const populatedCandidate = await Candidate.findById(newCandidate._id).populate('election', 'title');

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      candidate: populatedCandidate
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with similar details already exists',
        error: error.message
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding candidate',
      error: error.message
    });
  }
};

export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ success: false, message: 'Invalid election ID format' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidates = await Candidate.find({ election: electionId })
      .populate('election', 'title')
      .sort({ createdAt: -1 });

    const candidatesWithElectionTitle = candidates.map(candidate => ({
      ...candidate.toObject(),
      electionTitle: candidate.election?.title || 'Unknown Election'
    }));

    res.status(200).json({
      success: true,
      candidates: candidatesWithElectionTitle
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

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, email, phone, department, year, bio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID format' });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(position && { position: position.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(department !== undefined && { department: department.trim() }),
      ...(year !== undefined && { year: year.trim() }),
      ...(bio !== undefined && { bio: bio.trim() }),
    };

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('election', 'title');

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating candidate',
      error: error.message
    });
  }
};

export const updateCandidateImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID format' });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer);

      const updatedCandidate = await Candidate.findByIdAndUpdate(
        id,
        { image: result.secure_url },
        { new: true }
      ).populate('election', 'title');

      res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        candidate: updatedCandidate,
        imageUrl: result.secure_url
      });

    } catch (cloudinaryError) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: cloudinaryError.message
      });
    }

  } catch (error) {
    console.error('Update candidate image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating candidate image',
      error: error.message
    });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID format' });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    await Candidate.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });

  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting candidate',
      error: error.message
    });
  }
};

export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find({})
      .select('title description startDate endDate status isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      elections
    });
  } catch (error) {
    console.error('Get all elections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching elections',
      error: error.message
    });
  }
};
