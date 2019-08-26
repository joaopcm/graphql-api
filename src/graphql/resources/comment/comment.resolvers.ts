import { Transaction } from "sequelize";

import { CommentInstance } from "../../../models/CommentModel";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { handleError, throwError } from "../../../utils/utils";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { GraphQLResolveInfo } from "graphql";
import { RequestedFields } from "../../ast/RequestedFields";

export const commentResolvers = {
  Comment: {
    user: (comment: CommentInstance, args, { dataloaders: { userLoader } }: { dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
      return userLoader.load({ key: comment.get('user'), info }).catch(handleError)
    },

    post: (comment: CommentInstance, args, { dataloaders: { postLoader } }: { dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
      return postLoader.load({ key: comment.get('post'), info }).catch(handleError)
    }
  },
  Query: {
    commentsByPost: compose(...authResolvers)((parent, { postId, first = 10, offset = 0 }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      postId = parseInt(postId)

      return database.Comment.findAll({
        where: { post: postId },
        limit: first,
        offset,
        attributes: requestedFields.getFields(info)
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