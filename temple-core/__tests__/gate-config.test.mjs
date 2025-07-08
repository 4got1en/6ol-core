import { describe, it, expect, beforeAll } from 'vitest'
import Gate from '../gate-config.js'

describe('Gate Configuration', () => {
  beforeAll(() => {
    process.env.ORACLE_ADDRESS = '0xOracle'
  })

  it('allows oracle to write anywhere', () => {
    const oracle = { wallet: '0xOracle', loop: 0, status: 'us' }
    expect(Gate.canUserWrite(oracle, '/random.txt')).toBe(true)
  })
})
