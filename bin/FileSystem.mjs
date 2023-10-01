import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

export class FileSystem {
  static cwd () {
    return process.cwd()
  }

  static relative (from, to) {
    return path.relative(from, to)
  }

  static rename (oldPath, newPath, callback = () => {}) {
    return fs.rename(oldPath, newPath, callback)
  }

  static getPathFromCurrent (...paths) {
    return path.resolve(...[url.fileURLToPath(import.meta.url), ...paths])
  }

  static rootDir (name) {
    return path.join(this.cwd(), name)
  }

  static readDir (dir) {
    return fs.readdirSync(dir)
  }

  static mkdirSync (path, options) {
    fs.mkdirSync(path, options)
  }

  static isDirEmpty (dir) {
    if (!fs.existsSync(dir)) return true
    const files = fs.readdirSync(dir)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
  }

  static emptyDir (dir) {
    if (!fs.existsSync(dir)) return
    for (const file of fs.readdirSync(dir)) {
      if (file === '.git') { continue }
      fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
    }
  }

  static write (file, content) {
    fs.writeFileSync(file, content)
  }

  static writeOrCopy (src, dest, file, content = null) {
    const targetPath = path.join(dest, file)
    if (content) {
      this.write(targetPath, content)
    } else {
      this.copy(path.join(src, file), targetPath)
    }
  }

  static editFile (file, callback) {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, callback(content), 'utf-8')
  }

  static copy (src, dest) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
      this.copyDir(src, dest)
    } else {
      fs.copyFileSync(src, dest)
    }
  }

  static copyDir (srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true })
    
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.resolve(srcDir, file)
      const destFile = path.resolve(destDir, file)
      this.copy(srcFile, destFile)
    }
  }
}