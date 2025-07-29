import Election from '../models/electionModel.js';

export const createElection = async (req, res) => {
  try {
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can create elections" });
    }

    const { title, description, startDate, endDate, eligibleVoters } = req.body;

   
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Missing required fields: title, startDate, and endDate are required" 
      });
    }

 
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

   
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (start <= now) {
      return res.status(400).json({ message: "Start date must be in the future" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after the start date" });
    }

    
    const newElection = new Election({
      title: title.trim(),
      description: description ? description.trim() : '',
      startDate: start,
      endDate: end,
      createdBy: req.user._id,
   
      ...(eligibleVoters && { eligibleVoters: parseInt(eligibleVoters) })
    });

    const savedElection = await newElection.save();

 
    const populatedElection = await Election.findById(savedElection._id)
      .populate('createdBy', 'name email');

    res.status(201).json({ 
      message: "Election created successfully", 
      election: populatedElection 
    });

  } catch (error) {
    console.error("Error creating election:", error);
    
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }

    res.status(500).json({ 
      message: "Error creating election", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      message: "Elections fetched successfully",
      elections: elections
    });
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ 
      message: "Error fetching elections", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateElection = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can update elections" });
    }

    const { id } = req.params;
    const { title, description, startDate, endDate, eligibleVoters } = req.body;


    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

 
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : election.startDate;
      const end = endDate ? new Date(endDate) : election.endDate;
      const now = new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (start <= now && startDate) {
        return res.status(400).json({ message: "Start date must be in the future" });
      }

      if (end <= start) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }


    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (eligibleVoters) updateData.eligibleVoters = parseInt(eligibleVoters);

    const updatedElection = await Election.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: "Election updated successfully",
      election: updatedElection
    });

  } catch (error) {
    console.error("Error updating election:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }

    res.status(500).json({ 
      message: "Error updating election", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteElection = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can delete elections" });
    }

    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

   
    if (election.status === 'ongoing') {
      return res.status(400).json({ 
        message: "Cannot delete ongoing election" 
      });
    }

    await Election.findByIdAndDelete(id);

    res.json({
      message: "Election deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ 
      message: "Error deleting election", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const election = await Election.findById(id)
      .populate('createdBy', 'name email');
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({
      message: "Election fetched successfully",
      election: election
    });

  } catch (error) {
    console.error("Error fetching election:", error);
    res.status(500).json({ 
      message: "Error fetching election", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};