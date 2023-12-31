import { execSync } from 'child_process'
import { FileSystem } from './FileSystem.mjs'

export class ProjectBuilder {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  static getInstance (params) {
    return new this(params)
  }

  get #root () {
    return FileSystem.rootDir(this.#config.projectName)
  }

  build () {
    this
      .#starting()
      .#makeDir()
      .#copyFiles()
      .#terminate()
  }

  #starting () {
    console.log(`\nScaffolding project in ${this.#root}...`)

    return this
  }

  #makeDir () {
    if (this.#config.overwrite) {
      FileSystem.emptyDir(this.#root)
    } else {
      FileSystem.mkdirSync(this.#root, { recursive: true })
    }

    return this
  }

  #copyFiles () {
    const files = this.#getTemplateFiles()
    
    for (const file of files) {
      FileSystem.writeOrCopy(this.#getTemplateDir(), this.#root, file)
    }

    FileSystem.editFile(FileSystem.join(this.#root, 'package.json'), content => {
      const pkg = JSON.parse(content)
      pkg.name = this.#config.packageName
      return `${JSON.stringify(pkg, null, 2)}\n`
    })

    FileSystem.rename(FileSystem.join(this.#root, '_gitignore'), FileSystem.join(this.#root, '.gitignore'))
  
    return this
  }

  #terminate () {
    const pkgManager = this.#getPkgManager()
    const cdDir = FileSystem.relative(FileSystem.cwd(), this.#root)
    
    console.log('\nDone. Now run:\n')

    if (this.#root !== FileSystem.cwd()) {
      console.log(`  cd ${cdDir.includes(' ') ? `"${cdDir}"` : cdDir}`)
    }

    switch (pkgManager) {
      case 'yarn':
        console.log('  yarn')
        console.log('  yarn dev')
        break
      default:
        console.log(`  ${pkgManager} install`)
        console.log(`  ${pkgManager} run dev`)
        break
    }
    
    console.log()

    return this
  }

  #getTemplateFiles () {
    return FileSystem.readDir(this.#getTemplateDir())
  }

  #getTemplateDir () {
    return FileSystem.resolveFromDirname('../../', `template-${this.#config.template}`)
  }

  #getPkgManager () {
    const pkgInfo = this.#pkgFromUserAgent(process.env.npm_config_user_agent)
    return pkgInfo?.name ?? 'npm'
  }

  #pkgFromUserAgent (userAgent) {
    if (!userAgent) return undefined
    const pkgSpec = userAgent.split(' ')[0]
    const pkgSpecArr = pkgSpec.split('/')
    return {
      name: pkgSpecArr[0],
      version: pkgSpecArr[1],
    }
  }
}