import * as core from '@actions/core'
import walk from '@chronocide/fs-walk'
import { filter, includes } from 'lodash'

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    core.setOutput('Initializing', true)
    core.info('Initializing')
    const workspace = process.env.GITHUB_WORKSPACE ?? './'
    core.info(`workspace dir: ${workspace}`)

    const files = walk(workspace)
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

    core.setOutput('jsonFiles', jsonFiles)
    core.info(`jsonFiles ${jsonFiles}`)
  } catch (error: any) {
    core.setFailed(error)
  }
}

run()
