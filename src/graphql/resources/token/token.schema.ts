const tokenTypes: string = `
  type Token {
    token: String!
  }
`

const tokenMutations: string = `
  createToken(email: String!, password: String!): Token
`

export { tokenTypes, tokenMutations }