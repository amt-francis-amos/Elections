// Enhanced uploadProfilePicture function with better error handling
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    // Validate file type - more comprehensive check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: "File too large. Maximum size allowed is 5MB." 
      });
    }

    // Get current user to check for existing profile picture
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const bufferStream = streamifier.createReadStream(req.file.buffer);
    
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: "profile_pictures", // More descriptive folder name
            resource_type: "image",
            public_id: `user_${req.user._id}_${Date.now()}`, // Unique public_id
            transformation: [
              { 
                width: 400, 
                height: 400, 
                crop: "fill", 
                gravity: "face", // Focus on face if detected
                quality: "auto:good" // Optimize quality
              },
              { format: "auto" } // Auto-format selection
            ],
            // Add additional options
            invalidate: true, // Invalidate CDN cache
            overwrite: true,
            notification_url: null // Disable notifications
          }, 
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Image upload failed: ${error.message}`));
            } else {
              resolve(result);
            }
          }
        );
        
        // Handle stream errors
        bufferStream.on('error', (error) => {
          console.error("Stream error:", error);
          reject(new Error('File processing failed'));
        });
        
        bufferStream.pipe(stream);
      });
    };

    // Upload new image
    const uploadResult = await streamUpload();
    
    // Delete old profile picture from cloudinary if it exists
    if (currentUser.profilePicture) {
      try {
        // Extract public_id from the Cloudinary URL
        const urlParts = currentUser.profilePicture.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Old profile picture deleted: ${publicId}`);
      } catch (deleteError) {
        console.warn("Could not delete old profile picture:", deleteError.message);
        // Continue with the update even if old image deletion fails
      }
    }
    
    // Update user with new profile picture URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { 
        profilePicture: uploadResult.secure_url,
        // Optional: store additional metadata
        profilePicturePublicId: uploadResult.public_id
      }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      // If user update fails, clean up the uploaded image
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded image:", cleanupError);
      }
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Return success response
    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin
      }
    });

  } catch (error) {
    console.error("Profile picture upload error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Server error while uploading profile picture";
    
    if (error.message.includes('Invalid image')) {
      errorMessage = "Invalid image file";
    } else if (error.message.includes('File too large')) {
      errorMessage = "File size exceeds maximum limit";
    } else if (error.message.includes('upload failed')) {
      errorMessage = "Image upload service temporarily unavailable";
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};