import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
//import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { GraphQLScalarType  }  from 'graphql';
import { MongoClient } from 'mongodb';
import { Kind } from 'graphql/language';
import { PubSub } from 'apollo-server';
//import { SubscriptionServer } from 'subscriptions-transport-ws';
import * as cors from 'cors';
//import bodyParser from 'body-parser';
//import { execute, subscribe } from 'graphql';
//import * as http from 'http';
//import { makeExecutableSchema } from 'graphql-tools';
import { createServer } from 'http';

import { typeDefs } from './schema';

const MONGO_URL = 'mongodb://localhost:27017/battleship';
const dbName = 'battleship';
const port = process.env.PORT || 3001;
const prepare = (o) => {
	o._id = o._id.toString();
    return o;
}
const pubsub = new PubSub();

const GAME_ADDED = 'GAME_ADDED';

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
				game: async (obj, args) => {
					console.log(obj, args);
					return await Game.findOne(args);
				},
				history: async (obj, args) => {
					console.log(obj, args);
					return await History.findOne(args);
				},
				games: async (obj, args) => {
					console.log(obj, args);
					return await (await Game.find({}).toArray()).map(prepare);
				}
			},
			Mutation: {
				createGame: async (obj, args) => {
					console.log(obj, args);
					await pubsub.publish(GAME_ADDED, { gameAdded: args });
					const res = await Game.insertOne(args);
					return prepare(res.ops[0]);
				}
			},
			Subscription: {
				gameAdded: {
					resolve: (payload) => {
            return {
              customData: payload,
            };
          },
					subscribe: () => pubsub.asyncIterator([GAME_ADDED])// maybe ['gameAdded']
				}
			},
			Date: new GraphQLScalarType({
				name: 'Date',
				description: 'Date custom scalar type',
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

		apolloServer.applyMiddleware({ app });

		// const options = {
		// 	typeDefs,
		// 	resolvers,
		// };
		// const executableSchema = makeExecutableSchema(options);

		// const httpServer = http.createServer(app);
		// server.installSubscriptionHandlers(httpServer);

		// httpServer.listen(port, () => {
		// 	console.log(`GraphQL playground is running at http://localhost:` + port);
		// });

		app.use(cors());

	  // app.use('/graphql', bodyParser.json(), graphqlExpress({
		//  	schema: executableSchema
		// }));

		// app.use('/graphiql', graphiqlExpress({
		// 	endpointURL: '/graphql',
		// 	subscriptionsEndpoint: 'ws://localhost:3001/subscriptions'
		// }));

		const httpServer = createServer(app);
		apolloServer.installSubscriptionHandlers(httpServer);

		httpServer.listen({ port: port }, () =>{
			console.log(`Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
			console.log(`Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`)
		})

		// httpServer.listen(port, () => {
		// 	console.log(`Apollo Server is now running on http://localhost:${port}`);
		// 	// Set up the WebSocket for handling GraphQL subscriptions
		// 	new SubscriptionServer({
		// 		execute,
		// 		subscribe,
		// 		schema: executableSchema
		// 	}, {
		// 		server: httpServer,
		// 		path: '/subscriptions',
		// 	});
		// })
	});
}
export default start;
