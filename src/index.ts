//import express from 'express';
import * as express from 'express';

import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';

const port = 3001;

const server = new ApolloServer({
	typeDefs,
	resolvers
});
const start = () => {
	const app = express();
	
	server.applyMiddleware({ app });
	
	app.listen(port, () => {
		console.log(`GraphQL playground is running at http://localhost:` + port);
	});
}

export default start;
