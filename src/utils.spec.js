import * as u from './utils'

describe('utils', () => {
  it('has combineReducers', () => {
    expect(typeof u.combineReducers === 'function').toBeTruthy()
  })
})
