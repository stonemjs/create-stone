import templates from './templates.mjs'
import { FileSystem } from './FileSystem.mjs'

/**
 * Class representing a Questionnaire.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Questionnaire {
  #input
  #format
  #config

  /**
   * Create a Questionnaire.
   *
   * @param   {Container} container
   * @returns {Questionnaire}
   */
  static create (options = {}) {
    return new this(options)
  }

  /**
   * Create a Questionnaire.
   *
   * @param {Container} container
   */
  constructor ({ config, input, format }) {
    this.#input = input
    this.#format = format
    this.#config = config
  }

  /** @returns {Object[]} */
  get #templates () {
    return templates({ format: this.#format })
  }

  /** @returns {Object[]} */
  get #typings () {
    return [
      { value: 'vanilla', name: 'None (Vanilla)' },
      { value: 'typescript', name: 'Typescript' },
      { value: 'flow', name: 'Flow' }
    ]
  }

  /** @returns {Object[]} */
  get #packageManagers () {
    return [
      { value: 'npm', name: 'Npm' },
      { value: 'yarn', name: 'Yarn' },
      { value: 'pnpm', name: 'Pnpm' }
    ]
  }

  /** @returns {Object[]} */
  get #stoneModules () {
    return [
      { value: '@stone-js/env', name: 'Stone.js Dotenv' },
      { value: '@stone-js/router', name: 'Stone.js Router' },
      { value: '@stonejs-community/aws-lambda-adapter', name: 'AWS Lambda Adapter (By Stone.js Community)' }
    ]
  }

  /** @returns {Object[]} */
  get #lintingTools () {
    return [
      { value: 'none', name: 'None' },
      { value: 'standard', name: 'Standard' },
      { value: 'prettier', name: 'Prettier' }
    ]
  }

  /** @returns {Object[]} */
  get #testingFramework () {
    return [
      { value: 'none', name: 'None' },
      { value: 'jest', name: 'Jest' }
    ]
  }

  /** @returns {Object} */
  get #messages () {
    return {
      projectName: 'Project name: ',
      template: 'Starter template: ',
      typing: 'Static type checker: ',
      packageManager: 'Package manager: ',
      modules: 'Stone modules: ',
      linting: 'Linting tools: ',
      testing: 'Testing framework: ',
      initGit: 'Init Git?',
      overwrite: 'Overwrite directory: '
    }
  }

  /**
   * Get answers.
   *
   * @returns {Object}
   */
  getAnswers () {
    return this.#input.questionnaire([
      {
        name: 'projectName',
        message: this.#messages.projectName,
        default: this.#config.get('project.defaultDir')
      },
      {
        type: 'confirm',
        name: 'overwrite',
        message: ({ projectName }) => this.#getOverwriteMessage(projectName),
        when: ({ projectName }) => !FileSystem.isDirEmpty(projectName)
      },
      {
        type: 'confirm',
        name: 'overwriteChecker',
        when: ({ overwrite }) => {
          if (overwrite === false) {
            throw new Error(`${this.#format.red('✖')} Operation cancelled.`)
          }
          return false
        }
      },
      {
        type: 'list',
        name: 'template',
        default: 0,
        choices: this.#templates,
        message: this.#messages.template
      },
      {
        type: 'list',
        name: 'typing',
        default: 0,
        choices: this.#typings,
        message: this.#messages.typing
      },
      {
        type: 'list',
        name: 'packageManager',
        default: 0,
        choices: this.#packageManagers,
        message: this.#messages.packageManager
      },
      {
        type: 'checkbox',
        name: 'modules',
        default: 0,
        choices: this.#stoneModules,
        message: this.#messages.modules
      },
      {
        type: 'list',
        name: 'linting',
        default: 0,
        choices: this.#lintingTools,
        message: this.#messages.linting
      },
      {
        type: 'list',
        name: 'testing',
        default: 0,
        choices: this.#testingFramework,
        message: this.#messages.testing
      },
      {
        type: 'confirm',
        name: 'initGit',
        message: () => this.#messages.initGit
      },
      {
        type: 'confirm',
        name: 'confirmation',
        message: (answers) => this.#getConfirmationMessage(answers)
      },
      {
        type: 'confirm',
        name: 'confirmationChecker',
        when: ({ confirmation }) => {
          if (confirmation === false) {
            throw new Error(`${this.#format.red('✖')} Operation cancelled.`)
          }
          return false
        }
      }
    ], this.#config.project)
  }

  /**
   * Get override message.
   *
   * @returns {string}
   */
  #getOverwriteMessage (value) {
    const message = value === '.' ? 'Current directory' : `Target directory "${value}"`
    return `${message} is not empty. Remove existing files and continue?`
  }

  /**
   * Get confirmation message.
   *
   * @returns {string}
   */
  #getConfirmationMessage (answers) {
    const message = Object
      .entries(answers)
      .filter(([, value]) => !!value)
      .reduce((prev, [key, value]) => `${prev}\n${this.#messages[key]}${JSON.stringify(value)}`, '')

    return `Project will be generate with the below configurations: ${this.#format.blue(message)} \n Do you confirm?
    `
  }
}
