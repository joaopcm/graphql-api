import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { CommentInstance } from "../../../models/CommentModel";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { handleError, throwError } from "../../../utils/utils";

export const commentResolvers = {
  Comment: {
    user: (comment: CommentInstance, args, { database }: { database: DbConnection }) => {
      return database.User.findById(comment.get('user')).catch(handleError)
    },

    post: (comment: CommentInstance, args, { database }: { database: DbConnection }) => {
      return database.Post.findById(comment.get('post')).catch(handleError)
    }
  },
  Query: {
    commentsByPost: compose(...authResolvers)((parent, { postId, first = 10, offset = 0 }, { database }: { database: DbConnection }) => {
      postId = parseInt(postId)

      return database.Comment.findAll({
        where: { post: postId },
        limit: first,
        offset
      }).catch(handleError)
    })
  },
  Mutation: {
    createComment: compose(...authResolvers)((parent, { input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      input.user = authUser.id

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Comment.create(input, { transaction })
      }).catch(handleError)
    }),

    updateComment: compose(...authResolvers)((parent, { id, input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      id = parseInt(id)
      input.user = authUser.id

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Comment.findById(id).then((comment: CommentInstance) => {
          throwError(!comment, `Comment with id ${id} not found`)
          throwError(comment.get('user') !== authUser.id, 'Unauthorized! You can only edit comments by yourself')
          return comment.update(input, { transaction })
        })
      }).catch(handleError)
    }),

    deleteComment: compose(...authResolvers)((parent, { id }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      id = parseInt(id)

      return database.sequelize.transaction((transaction: Transaction) => {
        return database.Comment.findById(id).then((comment: CommentInstance) => {
          throwError(!comment, `Comment with id ${id} not found`)
          throwError(comment.get('user') !== authUser.id, 'Unauthorized! You can only delete comments by yourself')
          return comment.destroy({ transaction }).then(() => true).catch(() => false)
        })
      }).catch(handleError)
    })
  }
}