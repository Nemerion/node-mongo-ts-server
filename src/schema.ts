import { gql } from 'apollo-server-express';

// import { buildSchema } from "graphql";
// import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar Date

    type Query {
        game(_id:ID): Game
        history(_id: ID): GameHistory
        games: [Game]
    }

    type Mutation {
        createGame(boardStatus: [[Int]]): Game
    }

    type Subscription {
        gameAdded: Game
    }

    type Game {
        _id: ID
        boardStatus: [[Int]]
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
