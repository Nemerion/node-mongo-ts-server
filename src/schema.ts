import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar Date

    type Query {
        gamePool(_id:ID): Game
        gamesPool: [Game]
        myCurrentGames: [Game]
        user (id: ID!): User
    }

    type Mutation {
        createGame(createdAt:Date, name:String, timePlayed:String, boardStatus: [[Int]]): Game
        addToMyGames(createdAt:Date, name:String, timePlayed:String, _id:ID): Game
        signup (username: String!, password: String!): String
        login (password: String!): String
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
        user: User
    }

    type User {
        id: ID!
        name: String!
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;
