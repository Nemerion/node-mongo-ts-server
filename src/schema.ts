import {ObjectId} from 'mongodb';
import * as buildSchema from 'graphql';

import { Game, History } from './mongodataBase';

export const typeDefs = buildSchema(`
	type Query {
        game(_id:ID): Game
        history(_id: ID): GameHistory
    }

    type Game {
        _id: ID
        isYourTurn: Boo 
        BoardStatus: [I 
    }
    
    type GameHistory {
        startTime: Date 
        endTime: Date
        totalTurns: Int
        accuracy: Float
        status: Boolean
    }
`);

export const resolvers = {
    Query: {
        game: ({_id}) => {
            return Game.findOne(ObjectId(_id));
        },
        history: ({_id}) => {
            return History.findOne(ObjectId(_id));
        }
    }
}

/*
const emptyBoardMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
*/