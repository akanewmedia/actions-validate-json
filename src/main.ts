import * as core from '@actions/core'
import walk from '@chronocide/fs-walk'
import { filterJsonFiles, verifyJsonFiles } from './json-validation'

async function run(): Promise<void> {
  try {
    const workspace = process.env.GITHUB_WORKSPACE ?? './'
    core.info(`workspace directory: ${workspace}`)

    const files = walk(workspace)
    // Filters out all files that are not json files and not data files
    const jsonRegex = /(.+)\/(apps|libs)\/(.+)\.(json)/
    const jsonFiles = filterJsonFiles(files, jsonRegex)

    // Go through the json files and JSON.parse each file to make sure thet are valid
    verifyJsonFiles(jsonFiles)
  } catch (error: any) {
    core.setFailed(error)
  }
}

run()
