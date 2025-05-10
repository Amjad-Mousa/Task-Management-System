import User from '../../models/userModel.js';

const userResolvers = {
  getUsers: async () => await User.find(),
  getUser: async ({ id }) => {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  addUser: async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const newUser = new User({ name, email, password, role });
    return await newUser.save();
  },
  updateUser: async ({ id, name, email, password, role }) => {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return await User.findByIdAndUpdate(id, { name, email, password, role }, { new: true });
  },
  deleteUser: async ({ id }) => {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    await User.findByIdAndDelete(id);
    return "User deleted";
  }
};

export default userResolvers;
