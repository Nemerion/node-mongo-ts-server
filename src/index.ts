import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLScalarType  }  from 'graphql';
import { MongoClient, ObjectId } from 'mongodb';
import { Kind } from 'graphql/language';

import { schema } from './schema';

const MONGO_URL = 'mongodb://localhost:27017/battleship';
const dbName = 'battleship';
const port = process.env.PORT || 3001;

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
				game: (args) => {
					return Game.findOne(new ObjectId(args._id));
				},
				history: (args) => {
					return History.findOne(new ObjectId(args._id));
				}
			},
			Mutation: {
				updateGame: (args) => {
					return db.collection('game', (err, collection) => {
						if (err) console.log(err);
						collection.insertOne(args, (err, result) => {
							if (err) {
								console.log('error when inserting');
							} else {
								console.log(result, 'inserting successful');
							}
						});
					});
					/*return Game.insertOne(args, (err, records) => {
						if (err) {
							console.log('error when inserting');
						} else if (records){
							console.log('inserting successful');
						}
					});*/
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
			schema,
			resolvers
		});
		const app = express();

		server.applyMiddleware({ app });
		app.listen(port, () => {
			console.log(`GraphQL playground is running at http://localhost:` + port);
		});
	});
}
export default start;
