import * as express from 'express';
import { ApolloServer, PubSub } from 'apollo-server-express';
import { GraphQLScalarType  }  from 'graphql';
import { MongoClient , ObjectId} from 'mongodb';
import { Kind } from 'graphql/language';
import { createServer } from 'http';

// local
import { typeDefs } from './schema';

const MONGO_URL = 'mongodb://localhost:27017/battleship',
	dbName = 'battleship',
	port = process.env.PORT || 3001,
	pubsub = new PubSub(),
	GAME_ADDED = 'GAME_ADDED',
	prepare = (o) => {
	o._id = o._id.toString();
    return o;
}

const start = async () => {
	await MongoClient.connect(MONGO_URL, (err, client) => {
		if (err) {
			console.log(err, "There has been an error during server init");
		}
		console.log("Connected correctly to server");
		const db = client.db(dbName);

		const Game = db.collection('game');
		const History = db.collection('history');

		const resolvers = {
			Query: {
				//fieldName(obj, args, context, info) { result } positional arguments of resolvers.
				game: async (obj, {_id}) => {
					console.log(obj, _id);
					return prepare(await Game.findOne(new ObjectId(_id)));
				},
				history: async (obj, args) => {
					console.log(obj, args);
					return await History.findOne(args);
				},
				games: async () => {
					return await (await Game.find({}).toArray()).map(prepare);
				}
			},
			Mutation: {
				createGame: async (obj, args) => {
					const res = await Game.insertOne(args);
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
		
		const app = express();
		const apolloServer = new ApolloServer({
			typeDefs,
			resolvers,
		});

		apolloServer.applyMiddleware({ app });;

		const httpServer = createServer(app);
		apolloServer.installSubscriptionHandlers(httpServer);

		httpServer.listen({ port: port }, () =>{
			console.log(`Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
			console.log(`Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`)
		});
	});
}

export default start;
