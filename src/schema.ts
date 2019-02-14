import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar Date

    type Query {
        game(_id:ID): Game
        games: [Game]
        history(_id: ID): GameHistory
    }

    type Mutation {
        createGame(createdAt:Date, name:String, boardStatus: [[Int]]): Game
    }

    type Subscription {
        gameAdded: Game
    }

    type Game {
        _id: ID
        boardStatus: [[Int]]
        name: String
        createdAt: Date
    }
    
    type GameHistory {
        gameId: ID
        startTime: Date
        endTime: Date
        totalTurns: Int
        accuracy: Float
        status: Boolean
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;
