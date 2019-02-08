import MongoClient from 'mongodb';
//const MongoClient = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/';

const db = MongoClient.connect(MONGO_URL);

export const Game = db.collection('game');
export const History = db.collection('history');