const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    const dbUrl = 'mongodb+srv://DevanshAdmin:admin1234@chatapp.3mtyvti.mongodb.net/'; // Replace 'your_database_name' with your actual database name
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
     
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = connectToDatabase;
