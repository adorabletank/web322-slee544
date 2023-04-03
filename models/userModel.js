// Import dependencies
const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
},
role: {
  type: String,
  enum: ["data entry clerk", "customer"],
  required: true,
  default: "customer"
}
 
});

userSchema.pre("save", async function (next) {
    const user = this;
  
    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) {
      return next();
    }
  
    // generate a salt
    const salt = await bcrypt.genSalt(10);
  
    // hash the password using our new salt
    const hash = await bcrypt.hash(user.password, salt);
  
    // override the cleartext password with the hashed one
    user.password = hash;
  
    next();
  });
  

// Define user model
const userModel = mongoose.model('users', userSchema);

// Export user model
module.exports = userModel;

