import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  projectDescription: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  studentsWorkingOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Not Started'],
    default: 'Not Started'
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
