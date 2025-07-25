import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  },
  { timestamps: true }
);

voteSchema.index({ user: 1, election: 1 }, { unique: true }); 

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);
export default Vote;
