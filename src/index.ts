import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
//import { graphiqlExpress } from 'graphql-server-express';
import { GraphQLScalarType  }  from 'graphql';
import { MongoClient } from 'mongodb';
import { Kind } from 'graphql/language';

import { typeDefs } from './schema';

const MONGO_URL = 'mongodb://localhost:27017/battleship';
const dbName = 'battleship';
const port = process.env.PORT || 3001;
const prepare = (o) => {
	o._id = o._id.toString();
    return o;
}

const start = () => {
	MongoClient.connect(MONGO_URL, (err, client) => {
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
				game: (obj, args) => {
					console.log(obj, args);
					return Game.findOne(args);
				},
				history: (obj, args) => {
					console.log(obj, args,);
					return History.findOne(args);
				}
			},
			Mutation: {
				createGame: async (obj, args) => {
					console.log(obj, args);
					const res = await Game.insertOne(args);
					return prepare(res.ops[0]);
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
		
		const server = new ApolloServer({
			typeDefs,
			resolvers
			//context
		});
		const app = express();

		/*app.use('/graphiql', graphiqlExpress({
			endpointURL: '/graphql',
			subscriptionsEndpoint: 'ws://localhost:3000/subscriptions'
		}));*/
		
		server.applyMiddleware({ app });
		app.listen(port, () => {
			console.log(`GraphQL playground is running at http://localhost:` + port);
		});
	});
}
export default start;
