
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      });
    }

    const maxSize = 5 * 1024 * 1024; 
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: "File too large. Maximum size allowed is 5MB." 
      });
    }

  
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
            folder: "profile_pictures", 
            resource_type: "image",
            public_id: `user_${req.user._id}_${Date.now()}`, 
            transformation: [
              { 
                width: 400, 
                height: 400, 
                crop: "fill", 
                gravity: "face", 
                quality: "auto:good" 
              },
              { format: "auto" } 
            ],
          
            invalidate: true,
            overwrite: true,
            notification_url: null
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
        
        
        bufferStream.on('error', (error) => {
          console.error("Stream error:", error);
          reject(new Error('File processing failed'));
        });
        
        bufferStream.pipe(stream);
      });
    };

 
    const uploadResult = await streamUpload();
    
 
    if (currentUser.profilePicture) {
      try {
        
        const urlParts = currentUser.profilePicture.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Old profile picture deleted: ${publicId}`);
      } catch (deleteError) {
        console.warn("Could not delete old profile picture:", deleteError.message);
      
      }
    }
    
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { 
        profilePicture: uploadResult.secure_url,
      
        profilePicturePublicId: uploadResult.public_id
      }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
     
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