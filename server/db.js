const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Counter = require('./models/counterModel');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'Bowspace_Database',
        });
        console.log('MongoDB connected');
        //check the collection names int the database
        const collections = await mongoose.connection.db.listCollections().toArray();

        // Initialize the counter if it doesn't exist
        const counter = await Counter.findOne({ name: 'studentID' });
        if (!counter) {
            // Find the maximum studentID in the User collection
            const maxStudentIDUser = await User.findOne().sort({ studentID: -1 });
            console.log("maxStudentIDUser", maxStudentIDUser);
            const maxStudentID = maxStudentIDUser ? maxStudentIDUser.studentID : 100000;

            // Create the counter with the maximum studentID value
            await Counter.create({ name: 'studentID', value: maxStudentID });
        }

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
//mongoose.connect
