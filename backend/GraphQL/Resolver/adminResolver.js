import Admin from '../../models/adminModel.js';

const adminResolver = {
    getAdmins: async () => {
        return await Admin.find();
    },
    getAdmin: async ({ id }) => {
        return await Admin.findById(id);
    },
    addAdmin: async ({ user_id, permissions }) => {
        const newAdmin = new Admin({
            user_id,
            permissions
        });
        await newAdmin.save();
        return newAdmin;
    },
    updateAdmin: async ({ id, user_id, permissions }) => {
        return await Admin.findByIdAndUpdate(
            id, 
            { user_id, permissions }, 
            { new: true }
        );
     
    },
    deleteAdmin: async ({ id }) => {
        await Admin.findByIdAndDelete(id);
        return "Admin deleted successfully";
    }
};

export default adminResolver;
