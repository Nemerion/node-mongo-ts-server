import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, GraphQLScalarType  }  from 'graphql';
import * as MongoClient from 'mongodb';
import { Kind } from 'graphql/language';


const MONGO_URL = 'mongodb://localhost:27017/battleship';
const dbName = 'jueguito';
const port = 3001;

const start = () => {

	MongoClient.connect(MONGO_URL, (err, client) => {
		if (err) {
			console.log(err);
		}
		console.log("Connected correctly to server");
		const db = client.db(dbName);

		const Game = db.collection('game');
		const History = db.collection('history');

		const schema = buildSchema(`
			scalar Date

			type Query {
				game(_id:ID): Game
				history(_id: ID): GameHistory
			}

			type Game {
				_id: ID
				isYourTurn: Boolean
				BoardStatus: [Int]
			}
			
			type GameHistory {
				startTime: Date
				endTime: Date
				totalTurns: Int
				accuracy: Float
				status: Boolean
			}
		`);

		const resolvers = {
			Query: {
				game: ({_id}) => {
					return Game.findOne(new MongoClient.ObjectId(_id));
				},
				history: ({_id}) => {
					return History.findOne(new MongoClient.ObjectId(_id));
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
		}

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
