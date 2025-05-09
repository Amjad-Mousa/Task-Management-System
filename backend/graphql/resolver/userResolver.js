import User from "../../models/userModel.js";

const getUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    throw new Error(err);
  }
};

const getUser = async ({ id }) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const createUser = async ({ name, email, password, role }) => {
  try {
    const user = await User.create({ name, email, password, role });
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const updateUser = async ({ id, name, email, role }) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteUser = async ({ id }) => {
  try {
    const user = await User.findByIdAndDelete(id);
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

export default resolvers;
