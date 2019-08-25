import * as fs from 'fs'
import * as path from 'path'
import * as Sequelize from 'sequelize'

import { DbConnection } from '../interfaces/DbConnectionInterface';

const basename: string = path.basename(module.filename)
const environment: string = process.env.NODE_ENV || 'development'

let config = require(path.resolve(`${__dirname}./../config/config.json`))[environment]
let database = null

if (!database) {
  database = {}

  const operatorsAliases = false

  config = Object.assign({ operatorsAliases }, config)

  const sequelize: Sequelize.Sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )

  fs.readdirSync(__dirname).filter((file: string) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  }).forEach((file: string) => {
    const model = sequelize.import(path.join(__dirname, file))

    database[model['name']] = model
  })

  Object.keys(database).forEach((modelName: string) => {
    if (database[modelName].associate) {
      database[modelName].associate(database)
    }
  })

  database['sequelize'] = sequelize
}

export default <DbConnection>database