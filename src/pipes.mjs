import { join } from 'node:path'
import simpleGit from 'simple-git'
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpPath, basePath } from '@stone-js/common'
import { copySync, pathExistsSync, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm'

/**
 * Clone starter from Github
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const CloneStarterPipe = async (passable, next) => {
  const overwrite = passable.config.get('project.overwrite', false)
  const destDir = basePath(passable.config.get('project.projectName', 'stone-project'))
  const srcDir = tmpPath('stone-js-starters', passable.config.get('typing', 'vanilla'), passable.config.get('template', 'basic'))

  // Do not create project when path exists and overwrite is false
  if (!overwrite && pathExistsSync(destDir)) {
    throw new Error(`Target directory (${destDir}) is not empty. Remove existing files and continue.`)
  }

  // Display message
  passable.output.show(`Creating project in ${destDir}`)

  // Delete starters if exists
  removeSync(tmpPath('stone-js-starters'))

  // Clone starters to temp
  await simpleGit(tmpPath()).clone('https://github.com/stonemjs/starters.git', 'stone-js-starters')

  // Copy starter
  copySync(srcDir, destDir)

  // Get package.json
  const packageJson = readJsonSync(join(destDir, 'package.json'))

  // Save to config
  passable.config.defaults('project', { destDir, srcDir, packageJson })

  // Next pipe
  return next(passable)
}

/**
 * Install dependencies.
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const InstallDependenciesPipe = (passable, next) => {
  const destDir = passable.config.get('project.destDir')
  const linting = passable.config.get('project.linting')
  const testing = passable.config.get('project.testing')
  const modules = passable.config.get('project.modules', [])
  const manager = passable.config.get('project.packageManager', 'npm')
  const installCmd = manager === 'yarn' ? 'add' : 'install'
  const lintingDeps = linting === 'standard' ? ['@babel/eslint-parser'] : []
  const testingDeps = testing === 'jest' ? ['cross-env'] : ['@babel/register']

  // Display message
  passable.output.show('Installing packages. This might take a while...')

  // Install modules
  modules
    .concat(linting, testing, lintingDeps, testingDeps)
    .filter(module => !!module)
    .forEach(module => {
      execSync(`${manager} ${installCmd} ${module}`, { cwd: destDir })
    })

  // Next pipe
  return next(passable)
}

/**
 * Configure linting.
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const ConfigureLintingPipe = async (passable, next) => {
  const destDir = passable.config.get('project.destDir')
  const linting = passable.config.get('project.linting')
  const testing = passable.config.get('project.testing')
  const packageJson = passable.config.get('project.packageJson', {})

  if (linting === 'standard') {
    packageJson.scripts.lint = 'standard app'
    if (testing === 'jest') {
      packageJson.standard = {
        parser: '@babel/eslint-parser',
        globals: ['it', 'jest', 'test', 'expect', 'describe', 'afterEach', 'beforeEach']
      }
    }
  } else if (linting === 'prettier') {
    packageJson.scripts.format = 'prettier --write "app/**/*.js"'
    packageJson.scripts['format:check'] = 'prettier --check "app/**/*.js"'
    const prettierConfig = `
    {
      "singleQuote": true,
      "semi": false
    }
    `
    writeFileSync(join(destDir, '.prettierrc'), prettierConfig)
  }

  // Next pipe
  return next(passable)
}

/**
 * Configure testing.
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const ConfigureTestingPipe = async (passable, next) => {
  const testing = passable.config.get('project.testing')
  const destDir = passable.config.get('project.destDir')
  const packageJson = passable.config.get('project.packageJson', {})

  if (testing === 'jest') {
    packageJson.scripts.test = 'cross-env NODE_OPTIONS=--experimental-vm-modules jest'
    const jestConfig = {
      roots: ['app/', 'tests/'],
      transform: {},
      collectCoverageFrom: [
        'app/**/*.{js,mjs}'
      ],
      coverageThreshold: {
        global: {
          lines: 80,
          branches: 80,
          functions: 80
        }
      }
    }
    writeJsonSync(join(destDir, 'jest.config.json'), jestConfig)
  } else if (testing === 'mocha') {
    packageJson.scripts.test = 'mocha --require @babel/register'
  }

  // Next pipe
  return next(passable)
}

/**
 * Finalize.
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const FinalizePipe = async (passable, next) => {
  const destDir = passable.config.get('project.destDir')
  const packageJson = passable.config.get('project.packageJson', {})
  const manager = passable.config.get('project.packageManager', 'npm')
  const scriptPrefix = manager === 'yarn' ? 'yarn' : `${manager} run`
  const projectName = destDir.split('/').pop()
  const changeDir = passable.config.get('project.projectName')

  // Write Package.json
  writeJsonSync(join(destDir, 'package.json'), packageJson)

  // Git
  const git = simpleGit(destDir)
  await git.init()
  await git.add('.')
  await git.commit('Initial commit')

  // Display message
  passable.output.breakLine(1)
  passable.output.succeed(`Successfully created Stone's project "${projectName}"`)
  passable.output.show(`
  🎉 Happy coding!
  
  To get started:

    cd ${changeDir}/
    ${scriptPrefix} start
  
  To build for production:

    ${scriptPrefix} build
  
  Documentation:

    Check https://stonejs.com
  `)

  // Next pipe
  return next(passable)
}

/** @returns {Object[]} */
export const builderPipes = [
  { pipe: CloneStarterPipe, priority: 0 },
  { pipe: InstallDependenciesPipe, priority: 1 },
  { pipe: ConfigureLintingPipe, priority: 2 },
  { pipe: ConfigureTestingPipe, priority: 2 },
  { pipe: FinalizePipe, priority: 3 }
]
