import { Builder } from './Builder.mjs'
import templates from './templates.mjs'
import { Config } from '@stone-js/config'
import { version } from '../package.json'
import { builderPipes } from './pipes.mjs'
import { Mapper } from '@stone-js/adapters'
import { IncomingEvent } from '@stone-js/common'
import { Questionnaire } from './Questionnaire.mjs'
import { CommonInputMiddleware } from '@stone-js/cli'
import { Container } from '@stone-js/service-container'

/**
 * Class representing a Stone.js console Handler.
 *
 * @version 0.0.1
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Handler {
  #config
  #container

  /**
   * Create a Stone.js console handler.
   *
   * @param   {Object} options - Stone.js configuration options.
   * @returns {Handler}
   */
  static create (options = {}) {
    return new this(options)
  }

  /**
   * Create a Stone.js console handler.
   *
   * @param {Object} options - Stone.js configuration options.
   */
  constructor (options = {}) {
    this.#container = new Container()
    this.#config = Config.create(options)
    this.#container.instance(Config, this.#config).alias(Config, 'config')
    this.#container.singleton('inputMapper', (container) => Mapper.create(container, [CommonInputMiddleware], (passable) => IncomingEvent.create(passable.event)))
  }

  /** @return {Container} */
  get container () {
    return this.#container
  }

  /**
   * Hook that runs at each events and before everything.
   * Useful to initialize things at each events.
   */
  beforeHandle () {
    this.#registerCommand(this.#container.builder)
  }

  /**
   * Handle IncomingEvent.
   *
   * @param {IncomingEvent} event
   * @returns
   */
  async handle (event) {
    // Register components
    this.#addOptions(event)

    // Launch questionnaire on defaults false
    if (!event.get('yes', false)) {
      // Launch questionnaire and put answers to config
      const answers = await Questionnaire.create(this.#container).getAnswers()
      // Add answers to config
      this.#config.set('project', answers)
    }

    // Build Stone App
    await Builder.create(this.#container, builderPipes).build()
  }

  /**
   * Register components.
   *
   * @param {IncomingEvent} event.
   * @returns
   */
  #addOptions (event) {
    this.#config.set('templates', templates)
    this.#config.set('project.defaultDir', 'stone-project')
    this.#config.set('project.defaultTemplate', 'basic-vanilla')
    this.#config.set('project.template', event.get('template'))
    this.#config.set('project.projectName', event.get('project-name'))
  }

  /**
   * Register command.
   *
   * @param   {Object} builder - Yargs builder.
   * @returns
   */
  #registerCommand (builder) {
    builder
      .command({
        command: 'create-stone [project-name]',
        aliases: ['c'],
        desc: "CLI to quickly start a Stone's project from a basic template.",
        builder: (yargs) => {
          return yargs
            .positional('project-name', {
              type: 'string',
              desc: 'your project name'
            })
            .option('yes', {
              alias: 'y',
              type: 'boolean',
              desc: 'create with default values'
            })
            .option('template <string>', {
              alias: 't',
              type: 'string',
              default: false,
              desc: 'template name'
            })
        }
      })
      .help()
      .version(version)
  }
}
