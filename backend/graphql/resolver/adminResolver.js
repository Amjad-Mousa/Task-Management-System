import Admin from "../../models/adminModel.js";

const getAdmins = async () => {
  try {
    const admins = await Admin.find();
    return admins;
  } catch (err) {
    throw new Error(err);
  }
};

const getAdmin = async ({ id }) => {
  try {
    const admin = await Admin.findById(id);
    return admin;
  } catch (err) {
    throw new Error(err);
  }
};

const createAdmin = async ({ user_id, permissions }) => {
  try {
    const admin = await Admin.create({ user_id, permissions });
    return admin;
  } catch (err) {
    throw new Error(err);
  }
};

const updateAdmin = async ({ id, permissions }) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    );
    return admin;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteAdmin = async ({ id }) => {
  try {
    const admin = await Admin.findByIdAndDelete(id);
    return admin;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};

export default resolvers;
