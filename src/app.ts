import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'

import database from './models'
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';

class App {
  public express: express.Application

  constructor() {
    this.express = express()
    this.middleware()
  }

  private middleware(): void {
    this.express.use('/graphql',
      extractJwtMiddleware(),

      (req, res, next) => {
        req['context'].database = database
        next()
      },

      graphqlHTTP((req) => ({
        schema,
        graphiql: process.env.NODE_ENV === 'development',
        context: req['context']
      }))
    )
  }
}

export default new App().express