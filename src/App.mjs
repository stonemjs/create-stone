import { Handler } from './Handler.mjs'
import { NodeConsoleAdapter } from '@stone-js/cli'

/**
 * Class representing a create Stone.js app.
 *
 * @version 0.0.1
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class App {
  /**
   * Create a Stone.js console application and run it.
   *
   * @returns {Void}
   */
  static createAndRun () {
    return this.create().run()
  }

  /**
   * Create a Stone.js console application.
   *
   * @returns {App}
   */
  static create () {
    return new this()
  }

  /**
   * Run handler.
   *
   * @returns {Void}
   * @throws  {RuntimeError}
   */
  run () {
    NodeConsoleAdapter.createAndRun(() => Handler.create())
  }
}
