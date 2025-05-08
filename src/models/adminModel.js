
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: { type: [String], required: true },
  createdat: { type: Date, default: Date.now() },
  updatedat: { type: Date, default: Date.now() },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
