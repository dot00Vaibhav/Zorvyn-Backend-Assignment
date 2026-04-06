const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (mongoUri) {
            await mongoose.connect(mongoUri);
            console.log(`Connected to MongoDB: ${mongoUri}`);
            return;
        }

        // Fall back to an in-memory MongoDB instance for local development and tests.
        mongoServer = await MongoMemoryServer.create();
        const memoryDbUri = mongoServer.getUri();
        await mongoose.connect(memoryDbUri);

        console.log(`Connected to in-memory MongoDB: ${memoryDbUri}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    if (mongoose.connection.readyState) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
};

module.exports = { connectDB, disconnectDB };
