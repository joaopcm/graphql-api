import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from "../../../models/PostModel";

import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { handleError, throwError } from "../../../utils/utils";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const postResolvers = {
  Post: {
    author: (post: PostInstance, args, { database }: { database: DbConnection }) => {
      return database.User.findById(post.get('author')).catch(handleError)
    },

    comments: (post: PostInstance, { first = 10, offset = 0 }, { database }: { database: DbConnection }) => {
      return database.Comment.findAll({
        where: { post: post.get('id') },
        limit: first,
        offset
      }).catch(handleError)
    }
  },
  Query: {
    posts: compose(...authResolvers)((parent, { first = 10, offset = 0 }, { database }: { database: DbConnection }) => {
      return database.Post.findAll({
        limit: first,
        offset
      }).catch(handleError)
    }),

    post: compose(...authResolvers)((parent, { id }, { database }: { database: DbConnection }) => {
      id = parseInt(id)

      return database.Post.findById(id).then((post: PostInstance) => {
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