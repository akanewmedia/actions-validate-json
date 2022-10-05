import * as core from '@actions/core'
import walk from '@chronocide/fs-walk'
import { filter, includes, map } from 'lodash'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    core.setOutput('Initializing', true)
    core.info('Initializing')
    const workspace = process.env.GITHUB_WORKSPACE ?? './'
    core.info(`workspace dir: ${workspace}`)

    const files = walk(workspace)
    // Filters out all files that are not json files and not data files
    const jsonRegex = /(.+)\/(apps|libs)\/(.+)\.(json)/
    const jsonFiles = filter(
      files,
      o =>
        jsonRegex.test(o) &&
        !includes(o, 'e2e') &&
        !includes(o, 'tsconfig') &&
        !includes(o, 'ng-package') &&
        !includes(o, 'lint') &&
        !includes(o, 'package-lock')
    )

    // Go through the json files and JSON.parse each file to make sure thet are valid
    checkFiles({ jsonFiles })
  } catch (error: any) {
    core.setFailed(error)
  }
}

/**
 * Iterates throw the files and asttempts to JSON.parse them to check for validity
 *
 * @param {{ jsonFiles: string[] }} { jsonFiles } json files to check
 */
function checkFiles({ jsonFiles }: { jsonFiles: string[] }): void {
  map(jsonFiles, fileName => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      try {
        JSON.parse(data)
      } catch (e) {
        // if error print file name a set step to failed
        const result = (e as Error).message
        core.error(`File ${fileName} is invalid: ${result}`)
        core.setFailed(`File ${fileName} is invalid: ${result}`)
      }
    })
  })
}

run()
