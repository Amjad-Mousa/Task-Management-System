import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Not Started'], default: 'Not Started' },
  studentsWorkingOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  projectName: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
