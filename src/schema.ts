import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar Date

    type Query {
        gamePool(_id:ID): Game
        gamesPool: [Game]
        myCurrentGames: [Game]
    }

    type Mutation {
        createGame(createdAt:Date, name:String, timePlayed:String, boardStatus: [[Int]]): Game
        addToMyGames(createdAt:Date, name:String, timePlayed:String, _id:ID): Game
    }

    type Subscription {
        gameAdded: Game
        currentGamesAdded: Game
    }

    type Game {
        _id: ID
        boardStatus: [[Int]]
        name: String
        createdAt: Date
        endedAt: Date
        timePlayed: String
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
