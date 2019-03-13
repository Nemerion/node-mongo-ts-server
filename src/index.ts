import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { MongoClient } from 'mongodb';
import { createServer } from 'http';

// local
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

const MONGO_URL = 'mongodb://localhost:27017/battleship',
	dbName = 'battleship',
	port = process.env.PORT || 3001;

export const start = async () => {
	await MongoClient.connect(MONGO_URL, (err, client) => {
		if (err) console.log(err, "There has been an error during server init");
		console.log("Connected correctly to server");

		const db = client.db(dbName);
		const app = express();
		const apolloServer = new ApolloServer({
			typeDefs,
			resolvers,
			context: ({ req }) => {
				// get the user token from the headers
				//const token = req.headers.authorization || '';
				//console.log('vevvevevevo', req);
			   
				// try to retrieve a user with the token
				//const user = getUser(token);

				// optionally block the user
				// we could also check user roles/permissions here
				//if (!user) throw new AuthorizationError('you must be logged in'); 
			   
				// add the user to the context and the mongo database
				return { req, db };
			}
		});
		const httpServer = createServer(app);

		apolloServer.applyMiddleware({ app });;
		apolloServer.installSubscriptionHandlers(httpServer);
		httpServer.listen({ port: port }, () =>{
			console.log(`Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
			console.log(`Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`)
		});
	});
}
