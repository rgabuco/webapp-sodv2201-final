const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'Bowspace_Database',
        });
        console.log('MongoDB connected');
        //check the collection names int the database
        const collections = await mongoose.connection.db.listCollections().toArray();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
//mongoose.connect
