import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from "../../../models/PostModel";

import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { handleError, throwError } from "../../../utils/utils";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { GraphQLResolveInfo } from 'graphql';
import { RequestedFields } from "../../ast/RequestedFields";

export const postResolvers = {
  Post: {
    author: (post: PostInstance, args, { dataloaders: { userLoader } }: { dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
      return userLoader.load({ key: post.get('author'), info }).catch(handleError)
    },

    comments: (post: PostInstance, { first = 10, offset = 0 }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return database.Comment.findAll({
        where: { post: post.get('id') },
        limit: first,
        offset,
        attributes: requestedFields.getFields(info)
      }).catch(handleError)
    }
  },
  Query: {
    posts: compose(...authResolvers)((parent, { first = 10, offset = 0 }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return database.Post.findAll({
        limit: first,
        offset,
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['comments']
        })
      }).catch(handleError)
    }),

    post: compose(...authResolvers)((parent, { id }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      id = parseInt(id)

      return database.Post.findById(id, {
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['comments']
        })
      }).then((post: PostInstance) => {
        throwError(!post, `Post with id ${id} not found`)
        return post
      }).catch(handleError)
    }),
  },
  Mutation: {
    createPost: compose(...authResolvers)((parent, { input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      input.author = authUser.id

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Post.create(input, { transaction })
      }).catch(handleError)
    }),

    updatePost: compose(...authResolvers)((parent, { id, input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      id = parseInt(id)
      input.author = authUser.id

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Post.findById(id).then((post: PostInstance) => {
          throwError(!post, `Post with id ${id} not found`)
          throwError(post.get('author') !== authUser.id, 'Unauthorized! You can only edit posts by yourself')
          return post.update(input, { transaction })
        })
      }).catch(handleError)
    }),

    deletePost: compose(...authResolvers)((parent, { id }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      id = parseInt(id)

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Post.findById(id).then((post: PostInstance) => {
          throwError(!post, `Post with id ${id} not found`)
          throwError(post.get('author') !== authUser.id, 'Unauthorized! You can only delete posts by yourself')
          return post.destroy({ transaction }).then(() => true).catch(() => false)
        })
      }).catch(handleError)
    })
  }
}