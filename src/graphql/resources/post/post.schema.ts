const postTypes: string = `
  type Post {
    id: ID!
    title: String!
    content: String!
    photo: String!
    createdAt: String!
    updatedAt: String!
    author: User!
    comments(first: Int, offset: Int): [Comment!]!
  }

  input PostInput {
    title: String!
    content: String!
    photo: String!
  }
`

const postQueries: string = `
  posts(first: Int, offset: Int): [Post!]!
  post(id: ID!): Post!
`

const postMutations: string = `
  createPost(input: PostInput!): Post
  updatePost(id: ID!, input: PostInput!): Post
  deletePost(id: ID!): Boolean
`

export { postTypes, postQueries, postMutations }