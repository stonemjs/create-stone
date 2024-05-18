import simpleGit from 'simple-git'
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { FileSystem } from './FileSystem.mjs'
import { copySync, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm'

/**
 * Clone starter from Github
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const CloneStarterPipe = async (passable, next) => {
  // Get src and dest dir
  const tmpDir = FileSystem.join(FileSystem.tempDir(), 'stone-js-starters')
  const destDir = FileSystem.rootDir(passable.config.get('projectName', 'stone-project'))
  const srcDir = FileSystem.join(tmpDir, passable.config.get('typing', 'vanilla'), passable.config.get('template', 'basic'))

  // Save to config
  passable.config.defaults('project', { destDir, srcDir, tmpDir })

  // Clone starters to temp
  passable.output.info('Cloning project...')
  removeSync(tmpDir)
  await simpleGit(FileSystem.tempDir()).clone('https://github.com/stonemjs/starters.git', 'stone-js-starters')

  // Copy starter
  copySync(srcDir, destDir)
  FileSystem.copy(srcDir, destDir)

  // Delete starters
  removeSync(tmpDir)

  passable.output.info('Project cloned!')
  passable.output.info(`From (${srcDir}) to ${destDir}`)

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
  const manager = passable.config.get('project.packageManager', 'npm')
  const installCmd = manager === 'yarn' ? 'add' : 'install'

  let linting = passable.config.get('project.linting', 'none')
  let testing = passable.config.get('project.testing', 'none')

  linting = linting === 'none' ? null : linting
  testing = testing === 'none' ? null : testing

  passable.output.info('Installing modules')

  // install Stone modules
  passable.config.get('project.modules', []).forEach(module => {
    execSync(`${manager} ${installCmd} ${module}`, { cwd: destDir, stdio: 'inherit' })
  })

  // Install linting
  linting && execSync(`${manager} ${installCmd} ${linting}`, { cwd: destDir, stdio: 'inherit' })
  linting === 'standard' && execSync(`${manager} ${installCmd} @babel/eslint-parser`, { cwd: destDir, stdio: 'inherit' })

  // Install testing
  testing && execSync(`${manager} ${installCmd} ${testing}`, { cwd: destDir, stdio: 'inherit' })

  passable.output.info('Modules installed!')

  return next(passable)
}

/**
 * Configure.
 *
 * @param   {Passable} passable - Input data to transform via middleware.
 * @param   {Function} next - Pass to next middleware.
 * @returns {Passable}
 */
export const ConfigurePipe = async (passable, next) => {
  const destDir = passable.config.get('project.destDir')
  let linting = passable.config.get('project.linting', 'none')
  let testing = passable.config.get('project.testing', 'none')
  const packageJson = readJsonSync(FileSystem.join(destDir, 'package.json'))

  testing = testing === 'none' ? null : testing
  linting = linting === 'none' ? null : linting

  // Testing config
  if (testing === 'jest') {
    packageJson.scripts.test = 'jest'
    const jestConfig = {
      roots: ['app/', 'tests/'],
      transform: {
        '\\.m?[jt]sx?$': 'babel-jest'
      },
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
    writeJsonSync(FileSystem.join(destDir, 'jest.config.json'), jestConfig)
  }

  // Linting config
  if (linting === 'standard') {
    packageJson.scripts.lint = 'standard app'
    if (testing === 'jest') {
      packageJson.standard = {
        parser: '@babel/eslint-parser',
        globals: [
          'it',
          'jest',
          'test',
          'expect',
          'describe',
          'afterEach',
          'beforeEach'
        ]
      }
    }
  }

  if (linting === 'prettier') {
    packageJson.scripts.format = 'prettier --write "src/**/*.js"'
    packageJson.scripts['format:check'] = 'prettier --check "app/**/*.js"'
    const config = `
    {
      "singleQuote": true,
      "semi": false
    }
    `
    writeFileSync(FileSystem.join(destDir, '.prettierrc'), config)
  }

  // Write Package.json
  writeJsonSync(FileSystem.join(destDir, 'package.json'), packageJson)

  // Git init
  await simpleGit(passable.config.get('project.destDir')).init()

  passable.output.info('You can start working with Stone.js')
  console.log(packageJson)
  console.log(passable.config.get('project'))

  return next(passable)
}

/** @returns {Object[]} */
export const builderPipes = [
  { pipe: CloneStarterPipe, priority: 0 },
  { pipe: InstallDependenciesPipe, priority: 1 },
  { pipe: ConfigurePipe, priority: 2 }
]
