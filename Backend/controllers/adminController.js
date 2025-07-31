import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import transporter from '../config/nodemailer.js'; 

function generateVoterId() {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VTR-${randomStr}`;
}

function generateVoterPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const createVoter = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Voter name is required (minimum 2 characters)"
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
    }

    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Voter name already exists"
      });
    }

    let voterId = generateVoterId();
    while (await User.findOne({ userId: voterId })) {
      voterId = generateVoterId();
    }

    const plainPassword = generateVoterPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const normalizedEmail = email ? email.toLowerCase().trim() : `${voterId.toLowerCase()}@voter.local`;

    const voterData = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      userId: voterId,
      role: 'voter'
    };

    const voter = await User.create(voterData);

    if (email && email.trim()) {
      const mailOptions = {
        from: `"Voting App" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Voter Account Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Hello ${voter.name},</h2>
            <p>Your voter account has been successfully created. Below are your login credentials:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>User ID:</strong> <span style="font-family: monospace; background-color: #e8e8e8; padding: 2px 6px; border-radius: 3px;">${voterId}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; background-color: #e8e8e8; padding: 2px 6px; border-radius: 3px;">${plainPassword}</span></p>
            </div>
            <p style="color: #d9534f;"><strong>Important:</strong> Please keep this information secure and do not share it with anyone.</p>
            <p>You can now use these credentials to log into the voting system.</p>
            <p>Best regards,<br/>
            <strong>Admin Team</strong></p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to:", normalizedEmail);
      } catch (emailError) {
        console.error("❌ Error sending email:", emailError.message);
      }
    }

    console.log(`✅ Voter created by admin ${req.user.name}:`, voter.name);

    res.status(201).json({
      success: true,
      message: "Voter created successfully" + (email && email.trim() ? " and credentials sent to email" : ""),
      voter: {
        _id: voter._id,
        name: voter.name,
        email: voter.email,
        userId: voter.userId,
        role: voter.role,
        createdAt: voter.createdAt
      },
      credentials: {
        userId: voterId,
        password: plainPassword
      }
    });

  } catch (error) {
    console.error("Create voter error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating voter",
      error: error.message
    });
  }
};

export const getAllVoters = async (req, res) => {
  try {
    const voters = await User.find(
      { role: 'voter' }, 
      { password: 0 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Voters retrieved successfully",
      voters,
      total: voters.length
    });

  } catch (error) {
    console.error("Get voters error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching voters",
      error: error.message
    });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: "User is already an admin"
      });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Promote to admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while promoting user",
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long"
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user"
        });
      }
    }

    if (name && name.trim()) {
      const existingName = await User.findOne({
        name: name.trim(),
        _id: { $ne: id }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: "Name is already taken by another user"
        });
      }
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ['voter', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      success: true,
      stats: {
        totalVotes: 0, 
        totalUsers,
        totalVoters,
        totalAdmins,
        totalElections: 0, 
        activeElections: 0, 
        totalCandidates: 0 
      }
    });

  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching stats",
      error: error.message
    });
  }
};

// Fixed export function - this is the problematic one from the error
export const exportElectionResults = async (req, res) => {
  try {
    const { format, election } = req.query;
    
    // Check if election parameter is provided and not empty
    if (!election || election.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Election ID is required and cannot be empty' 
      });
    }

    // Validate format
    if (!format || !['json', 'csv', 'txt'].includes(format.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid format. Use json, csv, or txt' 
      });
    }

    // For now, return empty data since Vote model doesn't exist yet
    // This will be updated when you have the Vote model
    const votes = [];
    const electionData = {
      electionId: election,
      title: `Election ${election}`,
      exportedAt: new Date().toISOString(),
      votes: votes,
      summary: {
        totalVotes: votes.length,
        message: 'No votes found - Vote model not yet implemented'
      }
    };

    if (format.toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=election_${election}_results.json`);
      return res.json({
        success: true,
        data: electionData
      });
    }
    
    if (format.toLowerCase() === 'csv') {
      const header = ['voteId','electionId','candidateId','candidateName','voterId','voterName','voterEmail','timestamp'];
      const csv = header.join(',') + '\n' + '# No votes found - Vote model not yet implemented';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=election_${election}_results.csv`);
      return res.send(csv);
    }

    if (format.toLowerCase() === 'txt') {
      const txtContent = `Election Results Export
Election ID: ${election}
Exported at: ${new Date().toISOString()}
Format: Plain Text

Summary:
- Total Votes: 0
- Status: No votes found - Vote model not yet implemented

Note: This is a placeholder export. The actual vote data will be available once the Vote model is implemented.`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=election_${election}_results.txt`);
      return res.send(txtContent);
    }
    
  } catch (error) {
    console.error("Export results error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while exporting results",
      error: error.message
    });
  }
};

// New function to export all data (users, elections, candidates)
export const exportAllData = async (req, res) => {
  try {
    const { format } = req.query;
    
    // Validate format
    if (!format || !['json', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid format. Use json or csv' 
      });
    }

    // Get all data
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    // Note: You'll need to import and use your Election and Candidate models here
    // const elections = await Election.find({}).sort({ createdAt: -1 });
    // const candidates = await Candidate.find({}).sort({ createdAt: -1 });
    
    // For now, using empty arrays since models might not exist
    const elections = [];
    const candidates = [];

    const allData = {
      exportedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalElections: elections.length,
        totalCandidates: candidates.length
      },
      users: users,
      elections: elections,
      candidates: candidates
    };

    if (format.toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=all_data_export.json');
      return res.json({
        success: true,
        data: allData
      });
    }
    
    if (format.toLowerCase() === 'csv') {
      // Create CSV content
      let csvContent = 'Export Type,Name,Email,Role,User ID,Created At\n';
      
      // Add users data
      users.forEach(user => {
        csvContent += `User,"${user.name}","${user.email}","${user.role}","${user.userId}","${user.createdAt}"\n`;
      });
      
      // Add elections data (when available)
      // elections.forEach(election => {
      //   csvContent += `Election,"${election.title}","","","${election._id}","${election.createdAt}"\n`;
      // });
      
      // Add candidates data (when available)
      // candidates.forEach(candidate => {
      //   csvContent += `Candidate,"${candidate.name}","${candidate.email || ''}","${candidate.position}","${candidate._id}","${candidate.createdAt}"\n`;
      // });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=all_data_export.csv');
      return res.send(csvContent);
    }
    
  } catch (error) {
    console.error("Export all data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while exporting all data",
      error: error.message
    });
  }
};