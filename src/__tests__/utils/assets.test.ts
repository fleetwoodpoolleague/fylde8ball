import { logoSrc } from '../../utils/assets'

describe('logoSrc', () => {
  it('resolves a filename to a bundled asset URL', () => {
    const href = logoSrc('bapto-logo-1.png')
    expect(href).toBeTruthy()
    expect(href).toContain('bapto-logo-1.png')
  })

  it('returns null for an empty string', () => {
    expect(logoSrc('')).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(logoSrc(undefined)).toBeNull()
  })
})
