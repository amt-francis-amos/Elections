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

