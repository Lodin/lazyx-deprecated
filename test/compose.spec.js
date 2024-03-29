import {compose} from '../src'

describe('Function "compose"', () => {
  it('should compose from right to left', () => {
    const double = x => x * 2
    const square = x => x * x
    expect(compose(square)(5)).toBe(25)
    expect(compose(square, double)(5)).toBe(100)
    expect(compose(double, square, double)(5)).toBe(200)
  })

  it('should compose functions from right to left', () => {
    const a = next => x => next(`${x}a`)
    const b = next => x => next(`${x}b`)
    const c = next => x => next(`${x}c`)
    const final = x => x

    expect(compose(a, b, c)(final)('')).toBe('abc')
    expect(compose(b, c, a)(final)('')).toBe('bca')
    expect(compose(c, a, b)(final)('')).toBe('cab')
  })

  it('should throw an error if argument is not a function', () => {
    const square = x => x * x
    const add = (x, y) => x + y

    expect(() => compose(square, add, false)(1, 2)).toThrow()
    expect(() => compose(square, add, undefined)(1, 2)).toThrow()
    expect(() => compose(square, add, true)(1, 2)).toThrow()
    expect(() => compose(square, add, NaN)(1, 2)).toThrow()
    expect(() => compose(square, add, '42')(1, 2)).toThrow()
  })

  it('should be able to be seeded with multiple arguments', () => {
    const square = x => x * x
    const add = (x, y) => x + y
    expect(compose(square, add)(1, 2)).toBe(9)
  })

  it('should return the first given argument if given no functions', () => {
    expect(compose()(1, 2)).toBe(1)
    expect(compose()(3)).toBe(3)
    expect(compose()()).toBe(undefined)
  })

  it('should return the first function if given only one', () => {
    const fn = () => {}
    expect(compose(fn)).toBe(fn)
  })
})
