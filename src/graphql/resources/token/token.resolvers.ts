import * as jwt from 'jsonwebtoken'

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { JWT_SECRET } from '../../../utils/utils';
import { UserInstance } from "../../../models/UserModel";

export const tokenResolvers = {
  Mutation: {
    createToken: (parent, { email, password }, { database }: { database: DbConnection }) => {
      return database.User.findOne({
        where: { email: email },
        attributes: ['id', 'password']
      }).then((user: UserInstance) => {
        const errorMessage: string = 'Unauthorized, wrong email or password'
        if (!user || !user.isPassword(user.get('password'), password)) throw new Error(errorMessage)

        const payload = { sub: user.get('id') }

        return {
          token: jwt.sign(payload, JWT_SECRET, { expiresIn: '3d' })
        }
      })
    }
  }
}