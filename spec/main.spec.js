import { generate } from '../main.js'

describe('generate()', () => {
  it('generates unique code-refs', () => {
    let value1 = generate()
    let value2 = generate()
    expect(value1).not.toBe(value2)
  })

  it('returns a string', () => {
    expect(typeof generate()).toBe('string')
  })
})