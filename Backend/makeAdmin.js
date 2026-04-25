const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config({ path: "./config/config.env" });

const makeAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.DB_LOCAL_URI);
    console.log("Connected to DB");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save({ validateBeforeSave: false });

    console.log(`Success! ${user.name} (${user.email}) is now an ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Pass email as a command line argument
const emailArg = process.argv[2];
if (!emailArg) {
  console.log("Please provide an email address. Usage: node makeAdmin.js <email>");
  process.exit(1);
}

makeAdmin(emailArg);
