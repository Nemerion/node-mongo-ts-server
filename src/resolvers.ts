import { GraphQLScalarType  }  from 'graphql';
import { Kind } from 'graphql/language';
import { PubSub } from 'apollo-server-express';
import { ObjectId} from 'mongodb';

const GAME_ADDED = 'GAME_ADDED',
    CURRENT_GAME = 'CURRENT_GAME',
    pubsub = new PubSub(),
    prepare = (o) => {
        o._id = o._id.toString();
        return o;
    };

export const resolvers = {
    Query: {
        //fieldName(obj, args, context, info) { result } positional arguments of resolvers.
        gamePool: async (obj, {_id}, context) => {
            console.log(obj, _id);
            return prepare(await context.db.collection('gamePool').findOne(new ObjectId(_id)));
        },
        gamesPool: async (obj, args, context) => {
            console.log(obj, args, 'query gamesPool');
            return (await context.db.collection('gamePool').find({}).toArray()).map(prepare);
        },
        myCurrentGames: async (obj, args, context) => {
            console.log(obj, args, 'query myCurrentGames');
            return (await context.db.collection('myCurrentGames').find({}).toArray()).map(prepare);
        }
    },
    Mutation: {
        createGame: async (obj, args, context) => {
            const res = await context.db.collection('gamePool').insertOne(args);
            console.log(obj, 'mutation createGame');
            await pubsub.publish(GAME_ADDED, { gameAdded: prepare(res.ops[0]) });
            return prepare(res.ops[0]);
        },
        addToMyGames: async (obj, args, context) => {
            const res = await context.db.collection('myCurrentGames').insertOne(args);
            console.log(obj, 'mutation addToMyGames');
            await pubsub.publish(CURRENT_GAME, { currentGamesAdded: prepare(res.ops[0]) });
            return prepare(res.ops[0]);
        }
    },
    Subscription: {
        // resolve: (payload, variables) => { return }
        gameAdded: {
            subscribe: () => pubsub.asyncIterator([GAME_ADDED]),
        },
        currentGamesAdded: {
            subscribe: () => pubsub.asyncIterator([CURRENT_GAME])
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type.',
        parseValue(value) {
          return new Date(value); // value from the client
        },
        serialize(value) {
          return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return new Date(ast.value) // ast value is always in string format
          }
          return null;
        }
    })
};