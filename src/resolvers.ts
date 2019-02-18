import { GraphQLScalarType  }  from 'graphql';
import { Kind } from 'graphql/language';
import { PubSub } from 'apollo-server-express';
import { ObjectId} from 'mongodb';

const GAME_ADDED = 'GAME_ADDED',
    pubsub = new PubSub(),
    prepare = (o) => {
        o._id = o._id.toString();
        return o;
    };

export const resolvers = {
    Query: {
        //fieldName(obj, args, context, info) { result } positional arguments of resolvers.
        game: async (obj, {_id}, context) => {
            console.log(obj, _id);
            return prepare(await context.db.collection('game').findOne(new ObjectId(_id)));
        },
        history: async (obj, args, context) => {
            console.log(obj, args);
            return await context.db.collection('history').findOne(args);
        },
        games: async (obj, args, context) => {
            console.log(obj, args);
            return await (await context.db.collection('game').find({}).toArray()).map(prepare);
        }
    },
    Mutation: {
        createGame: async (obj, args, context) => {
            const res = await context.db.collection('game').insertOne(args);
            console.log(res.ops[0],obj, prepare(res.ops[0]));
            await pubsub.publish(GAME_ADDED, { gameAdded: prepare(res.ops[0]) });
            return prepare(res.ops[0]);
        }
    },
    Subscription: {
        gameAdded: {
            subscribe: () => pubsub.asyncIterator([GAME_ADDED]),
            // resolve: (payload, variables) => { return }
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type. i.e: `2018-06-29`',
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