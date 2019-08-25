const commentTypes: string = `
  type Comment {
    id: ID!
    comment: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    post: Post!
  }

  input CommentInput {
    comment: String!
    post: Int!
  }
`

const commentQueries: string = `
  commentsByPost(postId: ID!, first: Int, offset: Int): [Comment!]!
`

const commentMutations: string = `
  createComment(input: CommentInput!): Comment
  updateComment(id: ID!, input: CommentInput!): Comment
  deleteComment(id: ID!): Boolean
`

export { commentTypes, commentQueries, commentMutations }