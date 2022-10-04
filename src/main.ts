import * as core from '@actions/core'
import fs, {Dirent} from 'fs'
import util from 'util'
import path from 'path'
import {isNil} from 'lodash'

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    core.setOutput('Initializing', true)
    const readFile = util.promisify(fs.readFile)
    walk(
      '.',
      async (err: Error | null, results?: string[]) => {
        if (err !== null) {
          core.setFailed(err)
        }
        core.setOutput('results', results)
        if (!isNil(results) && !isNil(err) && results.length > 0) {
          for (const file of results) {
            const contents = await readFile(file)
            core.setOutput('contents', contents)
          }
        }
      },
      (f: string) => /.json$/.test(f)
    )
  } catch (error: any) {
    core.setFailed(error)
  }
}
/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function, returns all files with full path.
 * @param filter Optional filter to specify which files to include,
 *   e.g. for json files: (f: string) => /.json$/.test(f)
 * @see https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/50345475#50345475
 */
export function walk(
  dir: string,
  done: (err: Error | null, results?: string[]) => void,
  filter?: (f: string) => boolean
): void {
  let results: string[] = []
  fs.readdir(
    dir,
    {withFileTypes: true},
    (err: Error | null, list: Dirent[]): void => {
      if (err) {
        return done(err)
      }
      let pending = list.length
      if (!pending) {
        return done(null, results)
      }
      for (const f of list) {
        const file = path.resolve(dir, f.name)
        fs.stat(file, (err2, stat) => {
          if (stat.isDirectory()) {
            walk(
              file,
              (err3, res) => {
                if (res) {
                  results = results.concat(res)
                }
                if (!--pending) {
                  done(null, results)
                }
              },
              filter
            )
          } else {
            if (typeof filter === 'undefined' || (filter && filter(file))) {
              results.push(file)
            }
            if (!--pending) {
              done(null, results)
            }
          }
        })
      }
    }
  )
}

run()
