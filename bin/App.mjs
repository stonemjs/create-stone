import chalk from 'chalk'
import path from 'node:path'
import inquirer from 'inquirer'
import { Command } from 'commander'
import templates from './templates.mjs'
import { Questionnaire } from './Questionnaire.mjs'
import { ProjectBuilder } from './ProjectBuilder.mjs'

export class App {
  #cli
  #questionnaire

  constructor () {
    this.#cli = new Command()
    this.defaultTargetDir = 'stone-project'
    this.#questionnaire = new Questionnaire({ app: this, inquirer, templates, chalk })

    this.#initCommander()
  }

  static get instance () {
    return new this
  }

  init () {
    this.#questionnaire
      .getAnswers()
      .then(this.#createProjectStructure)
      .catch(e => console.log(e.message))
  }

  get argTargetDir () {
    return this.#cli.args[0]
  }

  get argTemplate () {
    return this.#cli.opts().template
  }

  get userInputs () {
    return {
      template: this.argTemplate,
      projectName: this.argTargetDir,
    }
  }

  formatTargetDir (value) {
    return value?.trim().replace(/\/+$/g, '')
  }

  toValidProjectName (value, defaults = false) {
    if (!value && defaults) return this.defaultTargetDir
    value = this.formatTargetDir(value)
    return value === '.' ? path.basename(path.resolve()) : value
  }

  toValidPackageName(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/^[^a-z\d\-~]+/g, '')
      .replace(/[^a-z\d\-~]+/g, '-')
  }

  isValidPackageName (value) {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(value)
  }

  #initCommander () {
    this
      .#cli
      .name('create-stone')
      .description("CLI to quickly start a Stone's project from a basic template")
      .version('1.0.0')
      .argument('[project-name]', 'your project name')
      .option('-y, --yes', 'reply yes for all questions')
      .option('-t, --template <string>', 'template name')
      .showHelpAfterError()
      .parse()
  }

  #createProjectStructure (answers) {
    ProjectBuilder
      .getInstance({ answers })
      .build()
  }
}