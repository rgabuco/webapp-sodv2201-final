const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' });

mongoose
    .connect(process.env.MONGO_URI, { dbName: 'Bowspace_Database' })
    .then((con) => {
        console.log('DB connection successful!');
    })
    .catch((err) => {
        console.error('DB connection error:', err);
        process.exit(1);
    });

// Get the model and JSON file from command line arguments
const modelPath = process.argv[2];
const jsonFilePath = process.argv[3];
const action = process.argv[4];

// Usage function
const showUsage = () => {
    console.log('Usage: node import-json-to-DB.js <modelPath> <jsonFilePath> <action>');
    console.log('Examples: node import-json-to-DB.js ../../models/programCoursesModel.js ../data/programCourses.json --import');
    console.log('          node import-json-to-DB.js ../../models/programCoursesModel.js ../data/programCourses.json --delete');
    console.log('Actions:');
    console.log('  --import   Import data into the database');
    console.log('  --delete   Delete data from the database');
    process.exit(1);
};

// Validate arguments
if (!modelPath || !jsonFilePath || !action) {
    showUsage();
}

// Dynamically require the model
let Model;
try {
    Model = require(modelPath);
} catch (error) {
    console.error('Error loading model:', error.message);
    showUsage();
}

// Validate if the JSON file exists
if (!fs.existsSync(jsonFilePath)) {
    console.error('Error: JSON file does not exist.');
    showUsage();
}

// Read JSON file
let data;
try {
    data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
} catch (error) {
    console.error('Error reading JSON file:', error.message);
    showUsage();
}

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Model.create(data);
        console.log('Data is successfully loaded!');
    } catch (error) {
        console.log('Error importing data:', error);
    }
    process.exit();
};

// DELETE DATA FROM THE COLLECTION
const deleteData = async () => {
    try {
        const countBefore = await Model.countDocuments();
        console.log(`Documents before deletion: ${countBefore}`);

        const result = await Model.deleteMany();
        console.log('Data successfully deleted!');
        console.log(`Deleted ${result.deletedCount} documents.`);

        const countAfter = await Model.countDocuments();
        console.log(`Documents after deletion: ${countAfter}`);
    } catch (error) {
        console.log('Error deleting data:', error);
    }
    process.exit();
};

if (action === '--import') {
    importData();
} else if (action === '--delete') {
    deleteData();
} else {
    showUsage();
}

console.log(process.argv);