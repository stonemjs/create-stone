import fs from 'node:fs'
import path from 'node:path'

export class FileSystem {
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