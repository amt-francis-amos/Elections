import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Election title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: { 
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required'],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'Start date must be in the future'
      }
    },
    endDate: { 
      type: Date, 
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    status: { 
      type: String, 
      enum: {
        values: ["upcoming", "ongoing", "ended"],
        message: 'Status must be upcoming, ongoing, or ended'
      },
      default: "upcoming"
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, 'Created by user is required'],
      validate: {
        validator: function(value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: 'Invalid user ID'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    votersCount: {
      type: Number,
      default: 0,
      min: [0, 'Voters count cannot be negative']
    },
    candidatesCount: {
      type: Number,
      default: 0,
      min: [0, 'Candidates count cannot be negative']
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


electionSchema.index({ status: 1, createdBy: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });


electionSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});


electionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = 'ended';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'ongoing';
  } else if (this.startDate > now) {
    this.status = 'upcoming';
  }
  
  next();
});


electionSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};


electionSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isActive: true });
};


electionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.isActive;
};


let Election;
try {
  Election = mongoose.model('Election');
} catch (error) {
  Election = mongoose.model('Election', electionSchema);
}

export default Election;