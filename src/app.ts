import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'

import database from './models'
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {
  public express: express.Application
  private dataLoaderFactory: DataLoaderFactory
  private requestedFields: RequestedFields

  constructor() {
    this.express = express()
    this.init()
  }

  private init(): void {
    this.requestedFields = new RequestedFields()
    this.dataLoaderFactory = new DataLoaderFactory(database, this.requestedFields)
    this.middleware()
  }

  private middleware(): void {
    this.express.use('/graphql',
      extractJwtMiddleware(),

      (req, res, next) => {
        req['context']['database'] = database
        req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders()
        req['context']['requestedFields'] = this.requestedFields
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