import knex from 'knex'
import knexConfig from '../knexfile.ts'

export const db = knex(knexConfig.development)
