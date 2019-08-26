import * as DataLoader from 'dataloader'

import { DataLoaders } from "../../interfaces/DataLoadersInterface";
import { DbConnection } from "../../interfaces/DbConnectionInterface";
import { UserInstance } from '../../models/UserModel';
import { UserLoader } from './UserLoader';
import { PostInstance } from '../../models/PostModel';
import { PostLoader } from './PostLoader';
import { RequestedFields } from '../ast/RequestedFields';
import { DataLoaderParam } from '../../interfaces/DataLoaderParamInterface';

export class DataLoaderFactory {
  constructor(
    private database: DbConnection,
    private requestedFields: RequestedFields
  ) {}

  getLoaders(): DataLoaders {
    return {
      userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
        (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.database.User, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key }
      ),
      postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
        (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.database.Post, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key }
      )
    }
  }
}