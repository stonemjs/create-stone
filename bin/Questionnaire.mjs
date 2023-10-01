export class Questionnaire {
  #app
  #chalk
  #inquirer
  #templates

  constructor ({ app, inquirer, templates, chalk }) {
    this.#app = app
    this.#chalk = chalk
    this.#inquirer = inquirer
    this.#templates = templates
  }

  getAnswers () {
    return this.#inquirer.prompt([
      {
        name: 'projectName',
        message: 'Project name: ',
        default: this.#app.defaultTargetDir
      },
      {
        type: 'confirm',
        name: 'overwrite',
        message: ({ projectName }) => this.#getConfirmMessage(projectName),
        when: ({ projectName }) => !this.#app.isTargetDirEmpty(projectName),
      },
      {
        type: 'confirm',
        name: 'overwriteChecker',
        when: ({ overwrite }) => {
          if (overwrite === false) {
            throw new Error(this.#chalk.red('✖') + ' Operation cancelled.')
          }
          return false
        }
      },
      {
        name: 'packageName',
        message: 'Package name: ',
        default: ({ projectName }) => {
          return this.#app.toValidPackageName(this.#app.toValidProjectName(projectName))
        },
        when: (inquirer) => {
          const projectName = this.#app.toValidPackageName(this.#app.toValidProjectName(inquirer.projectName))
          inquirer.packageName = this.#app.toValidPackageName(projectName)
          return !this.#app.isValidPackageName(projectName)
        },
        validate: (input) => this.#app.isValidPackageName(input) || 'Invalid package.json name'
      },
      {
        type: 'list',
        name: 'template',
        default: 0,
        choices: this.#templates,
        message: ({ template }) => this.#getTemplateMessage(template),
        when: ({ template }) => !this.#templates.includes(template),
      },
    ], this.#app.userInputs)
  }

  #getConfirmMessage (value) {
    const message = value === '.' ? 'Current directory' : `Target directory "${value}"`
    return `${message} is not empty. Remove existing files and continue?`
  }

  #getTemplateMessage (value) {
    return value && !this.#templates.includes(value)
      ? `"${value}" isn't a valid stater. Please choose from below: `
      : 'Choose a starter: '
  }
}