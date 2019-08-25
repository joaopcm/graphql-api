const userTypes: string = `
  # User definition type
  type User {
    id: ID!
    name: String!
    email: String!
    photo: String
    createdAt: String!
    updatedAt: String!
    posts(first: Int, offset: Int): [Post!]!
  }

  input UserCreateInput {
    name: String!
    email: String!
    password: String!
  }

  input UserUpdateInput {
    name: String!
    email: String!
    photo: String
  }

  input UserUpdatePasswordInput {
    password: String!
  }
`

const userQueries: string = `
  users(first: Int, offset: Int): [User!]!
  user(id: ID!): User!
  currentUser: User!
`

const userMutations: string = `
  createUser(input: UserCreateInput!): User
  updateUser(input: UserUpdateInput!): User
  updateUserPassword(input: UserUpdatePasswordInput!): Boolean
  deleteUser: Boolean
`

export { userTypes, userQueries, userMutations }