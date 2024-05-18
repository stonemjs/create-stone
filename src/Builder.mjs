import { Pipeline } from '@stone-js/pipeline'

/**
 * Class representing a Builder.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Builder {
  #pipes
  #container

  /**
   * Create a Builder.
   *
   * @param   {Container} container
   * @param   {(Function[]|Object[])} pipes
   * @returns {Builder}
   */
  static create (container, pipes) {
    return new this(container, pipes)
  }

  /**
   * Create a Builder.
   *
   * @param {Container} container
   * @param {(Function[]|Object[])} pipes
   */
  constructor (container, pipes) {
    this.#pipes = pipes
    this.#container = container
  }

  /**
   * Build config.
   *
   * @returns {Object}
   */
  build () {
    return Pipeline
      .create()
      .send(this.#container)
      .through(this.#pipes)
      .then(() => {})
  }
}
