import * as core from '@actions/core'
import walk from '@chronocide/fs-walk'
import path from 'path'

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    core.setOutput('Initializing', true)
    core.info('Initializing')
    const workspace = process.env.GITHUB_WORKSPACE ?? './'
    core.info(`workspace dir: ${workspace}`)

    const files = walk(path.resolve(__dirname))

    core.setOutput('files', files)
    core.info(`files ${files}`)
  } catch (error: any) {
    core.setFailed(error)
  }
}

run()
