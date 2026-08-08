import { Cookie } from '../src/types'

export default [
  {
    domain: '.example.com',
    httpOnly: true,
    name: 'session_id',
    path: '/',
    sameSite: 'Lax',
    secure: true,
    value: 'some_session_value_24478375j2hfjejfhsef7dfhf87878',
  },
  {
    domain: '.example.com',
    httpOnly: false,
    name: 'some-secret-token',
    path: '/',
    sameSite: 'Lax',
    secure: true,
    value: 'ziPUd-H5B0BRB-7vw_eCO',
  },
] satisfies Cookie[]
