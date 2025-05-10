import Admin from '../../models/adminModel.js';
import User from '../../models/userModel.js';

const adminResolvers = {
  getAdmins: async () => await Admin.find(),
  
  getAdmin: async ({ id }) => {
    const admin = await Admin.findOne({ user_id: id });
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin;
  },
  
  addAdmin: async ({ name, email, password, permissions }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const newUser = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    await newUser.save();

    const newAdmin = new Admin({
      user_id: newUser._id,  
      permissions
    });

    await newAdmin.save();

    return newAdmin;
  },

  // تحديث بيانات الأدمن
  updateAdmin: async ({ id, user_id, permissions }) => {
    const admin = await Admin.findOne({ user_id: id });  
    if (!admin) {
      throw new Error("Admin not found");
    }
    return await Admin.findOneAndUpdate({ user_id: id }, { user_id, permissions }, { new: true });
  },

  deleteAdmin: async ({ id }) => {
    const admin = await Admin.findOne({ user_id: id });  
    if (!admin) {
      throw new Error("Admin not found");
    }
    await Admin.deleteOne({ user_id: id });
    return "Admin deleted successfully";
  },
};

export default adminResolvers;
