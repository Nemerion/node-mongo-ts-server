import { buildSchema } from "graphql";

export const schema = buildSchema(`
    scalar Date

    type Query {
        game(_id:ID!): Game
        history(_id: ID!): GameHistory
    }

    type Mutation {
        updateGame(_id:ID!, isYourTurn: Boolean!, boardStatus: [Int]!): Game
    }

    type Game {
        _id: ID!
        isYourTurn: Boolean
        boardStatus: [Int]
    }
    
    type GameHistory {
        gameId: ID!
        startTime: Date
        endTime: Date
        totalTurns: Int
        accuracy: Float
        status: Boolean
    }

    schema {
        query: Query
        mutation: Mutation
    }
`);

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