import User from "../../models/userModel.js";

const userResolver ={
  getUsers: async()=>{
    return await User.find();
  }, 
  getUser: async({id})=>{
    return await User.findById(id);
  },
  addUser: async({name,email,password,role})=>{
            const newUser = new User({name,email,password,role});
            await newUser.save();
            return newUser;
  },
    updateUser: async({id,name,email,password,role})=>{
              return await User.findByIdAndUpdate(id,{name,email,password,role},{new:true});
             
  },
  deleteUser: async({id})=>{
            await User.findByIdAndDelete(id);
            return "User deleted successfully";
  } 
};
     export default userResolver;