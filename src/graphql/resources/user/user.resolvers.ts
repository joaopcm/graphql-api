import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { handleError, throwError } from "../../../utils/utils";
import { RequestedFields } from "../../ast/RequestedFields";
import { GraphQLResolveInfo } from "graphql";

export const userResolvers = {
  User: {
    posts: (user: UserInstance, { first = 10, offset = 0 }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return database.Post.findAll({
        where: { author: user.get('id') },
        limit: first,
        offset,
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['comments']
        })
      }).catch(handleError)
    }
  },
  Query: {
    users: compose(...authResolvers)(((parent, { first = 10, offset = 0 }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return database.User.findAll({
        limit: first,
        offset,
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['posts']
        })
      }).catch(handleError)
    })),

    user: compose(...authResolvers)((parent, { id }, { database, requestedFields }: { database: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      id = parseInt(id)

      return database.User.findById(id, {
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['posts']
        })
      }).then((user: UserInstance) => {
        throwError(!user, `User with id ${id} not found`)
        return user
      }).catch(handleError)
    }),

    currentUser: compose(...authResolvers)((parent, args, { database, authUser, requestedFields }: { database: DbConnection, authUser: AuthUser, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return database.User.findById(authUser.id, {
        attributes: requestedFields.getFields(info, {
          keep: ['id'],
          exclude: ['posts']
        })
      }).then((user: UserInstance) => {
        throwError(!user, `User with id ${authUser.id} not found`)
        return user
      }).catch(handleError)
    })
  },
  Mutation: {
    createUser: (parent, { input }, { database }: { database: DbConnection }) => {
      return database.sequelize.transaction((transaction: Transaction) => {
        return database.User.create(input, { transaction })
      }).catch(handleError)
    },

    updateUser: compose(...authResolvers)((parent, { input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      return database.sequelize.transaction((transaction: Transaction) => {
        return database.User.findById(authUser.id).then((user: UserInstance) => {
          throwError(!user, `User with id ${authUser.id} not found`)
          return user.update(input, { transaction })
        })
      }).catch(handleError)
    }),

    updateUserPassword: compose(...authResolvers)((parent, { input }, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      return database.sequelize.transaction((transaction: Transaction) => {
        return database.User.findById(authUser.id).then((user: UserInstance) => {
          throwError(!user, `User with id ${authUser.id} not found`)
          return user.update(input, { transaction }).then((user: UserInstance) => !!user)
        })
      }).catch(handleError)
    }),

    deleteUser: compose(...authResolvers)((parent, args, { database, authUser }: { database: DbConnection, authUser: AuthUser }) => {
      return database.sequelize.transaction((transaction: Transaction) => {
        return database.User.findById(authUser.id).then((user: UserInstance) => {
          throwError(!user, `User with id ${authUser.id} not found`)
          return user.destroy({ transaction }).then(() => true).catch(() => false)
        })
      }).catch(handleError)
    })
  }
}