import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  universityId: { type: String, required: true },
  major: { type: String, required: true },
  year: { type: String, required: true },
}, { timestamps: true }); 

const Student = mongoose.model('Student', studentSchema);

export default Student;
