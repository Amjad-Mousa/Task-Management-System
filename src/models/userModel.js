import mongoose from 'mongoose';
import { number } from 'prop-types';

const userSchema = new mongoose.Schema({
    user_id: { type: number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  createdat: { type: Date, default: Date.now() },
  updatedat: { type: Date, default: Date.now() },  
});

const User = mongoose.model('User', userSchema);

export default User;
