import walk from '@chronocide/fs-walk'
import * as path from 'path'
import { expect } from '@jest/globals'
import { filter } from 'lodash'
import { verifyJsonFiles } from '../src/json-validation'

let mockCallback = jest.fn()
describe('@akanewmedia-actions-validate-json', () => {
  beforeEach(() => {
    mockCallback = jest.fn()
    process.stdout.write = mockCallback
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('check json files with failure', () => {
    const workspace = path.join(__dirname, 'fixtures')
    const files = walk(workspace)
    // Filters out all files that are not json files and not data files
    const jsonRegex = /(.+)\/(.+)\.(json)/
    const jsonFiles = filter(files, o => jsonRegex.test(o))
    verifyJsonFiles(jsonFiles)

    assertWriteCalls(mockCallback.mock.calls, [
      '::error::File /Users/damien/projects/aka/actions/actions-validate-json/__tests__/fixtures/a/b/c/bad.json'
    ])
  })

  it('check json files with success', () => {
    const workspace = path.join(__dirname, 'fixtures')
    const files = walk(workspace)

    // Filters out all files that are not json files and not data files
    const jsonRegex = /(.+)\/(.+)\.(json)/
    const jsonFiles = filter(
      files,
      o => jsonRegex.test(o) && o.includes('good')
    )

    verifyJsonFiles(jsonFiles)
    assertWriteCalls(mockCallback.mock.calls, [])
  })
})

// Assert that process.stdout.write calls called only with the given arguments.
function assertWriteCalls(writeCalls: any[], calls: string[]): void {
  expect(process.stdout.write).toHaveBeenCalledTimes(calls.length)

  for (let i = 0; i < calls.length; i++) {
    expect(writeCalls[i][0]).toContain(calls[i])
  }
}
