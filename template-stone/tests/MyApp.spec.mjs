import { MyApp } from '../src/MyApp.mjs'

describe('MyApp', () => {
  it('`MyApp` must have a `run` method', function () {
    // Arrange
    const myApp = new MyApp({ app: { getEnvironment: () => 'test' } })
    // Assert
    this.assert.isOk('run' in myApp)
  })
})
