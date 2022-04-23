import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(
  process.env.MONGO_DB_URI || 'mongodb://localhost:27017',
  {
    useUnifiedTopology: true
  }
);

mongoClient.connect();

const db = mongoClient.db('analytics');

export default db;
