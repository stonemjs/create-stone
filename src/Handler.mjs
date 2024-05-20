import { Builder } from './Builder.mjs'
import { Config } from '@stone-js/config'
import { version } from '../package.json'
import { builderPipes } from './pipes.mjs'
import { AdapterMapper } from '@stone-js/core'
import { Questionnaire } from './Questionnaire.mjs'
import { CommonInputMiddleware } from '@stone-js/cli'
import { Container } from '@stone-js/service-container'
import { IncomingEvent } from '@stone-js/event-foundation'

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
   * @returns {Handler}
   */
  static create () {
    return new this()
  }

  /**
   * Create a Stone.js console handler.
   */
  constructor () {
    this.#config = Config.create()
    this.#container = new Container()
    this.#container.instance(Config, this.#config).alias(Config, 'config')
    this.#container.singleton('inputMapper', (container) => this.#makeMapper(container))
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
    // Initialize project options
    this.#initProjectOptions(event)

    try {
      // Launch questionnaire on defaults false
      if (!event.get('yes', false)) {
        // Launch questionnaire and put answers to config
        const answers = await Questionnaire.create(this.#container).getAnswers()
        // Add answers to config
        this.#config.set('project', answers)
      }

      // Build Stone App
      await Builder.create(this.#container, builderPipes).build()
    } catch (error) {
      this.#container.output.error(error.message)
    }
  }

  /**
   * Make adapter's mapper.
   *
   * @param   {Container} container
   * @returns {AdapterMapper}
   */
  #makeMapper (container) {
    return AdapterMapper.create(
      container,
      [CommonInputMiddleware],
      ({ event }) => IncomingEvent.create(event)
    )
  }

  /**
   * Initialize project options.
   *
   * @param {IncomingEvent} event
   * @returns
   */
  #initProjectOptions (event) {
    this.#config.set('project.initGit', true)
    this.#config.set('project.testing', 'mocha')
    this.#config.set('project.typing', 'vanilla')
    this.#config.set('project.template', 'basic')
    this.#config.set('project.linting', 'standard')
    this.#config.set('project.packageManager', 'npm')
    this.#config.set('project.overwrite', event.get('force'))
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
        command: '$0 [project-name]',
        desc: "CLI to quickly start a Stone's project from a starter template.",
        builder: (yargs) => {
          return yargs
            .positional('project-name', {
              type: 'string',
              default: 'stone-project',
              desc: 'your project name'
            })
            .option('yes', {
              alias: 'y',
              default: false,
              type: 'boolean',
              desc: 'create with default values'
            })
            .option('force', {
              alias: 'f',
              default: false,
              type: 'boolean',
              desc: 'Force overwriting'
            })
        }
      })
      .help()
      .version(version)
      .scriptName('create-stone')
      .demandCommand(1, 'You need at least one command before moving on')
  }
}
