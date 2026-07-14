import type { Knex } from 'knex'

export function up(knex: Knex) {
  return knex.schema.createTable('focus-sessions', (table) => {
    table.increments('id').primary()
    table.integer('duration').notNullable()
    table.string('task').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export function down(knex: Knex) {
  return knex.schema.dropTable('focus-sessions')
}
