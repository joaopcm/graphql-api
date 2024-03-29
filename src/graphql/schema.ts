import { makeExecutableSchema } from 'graphql-tools'
import { merge } from 'lodash'

import { Mutation } from './mutation'
import { Query } from './query'

import { commentTypes } from './resources/comment/comment.schema';
import { postTypes } from './resources/post/post.schema';
import { tokenTypes } from './resources/token/token.schema';
import { userTypes } from './resources/user/user.schema';

import { commentResolvers } from './resources/comment/comment.resolvers';
import { postResolvers } from './resources/post/post.resolvers';
import { tokenResolvers } from './resources/token/token.resolvers';
import { userResolvers } from './resources/user/user.resolvers';

const resolvers = merge(
  commentResolvers,
  postResolvers,
  tokenResolvers,
  userResolvers
)

const schemaDefinition: string = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`

export default makeExecutableSchema({
  typeDefs: [
    schemaDefinition,
    Query,
    Mutation,
    commentTypes,
    postTypes,
    tokenTypes,
    userTypes
  ],
  resolvers
})