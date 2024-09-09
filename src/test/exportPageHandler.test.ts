import { dialog } from 'electron'
import * as fs from 'fs'
import { expect, test } from '@jest/globals'
import { exportPageHandler } from '../main/pageExporter'
import { PageExporterFileFormat } from '../preload/types'
import { join } from 'path'

const genRandomStr = () => (Math.random() + 1).toString(36).substring(7)

function readFile(path, options) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(path, options)

    const chunks = []
    fileStream.on('data', (data) => {
      chunks.push(data)
    })

    fileStream.on('close', () => {
      resolve(chunks.toString())
    })

    fileStream.on('error', (err) => {
      reject(err)
    })
  })
}

jest.mock('electron', () => ({
  dialog: {
    showSaveDialog: jest.fn(({ defaultPath }) =>
      Promise.resolve({ canceled: false, filePath: defaultPath })
    )
  }
}))

const mockDialog = dialog as jest.Mocked<typeof dialog>

test('should generate a png file', async () => {
  const generatedScreenshotPath = join(__dirname, `/temp/test_screenshot_${genRandomStr()}.png`)

  // mock the dialog to return the path of the generated file
  mockDialog.showSaveDialog.mockResolvedValueOnce({
    canceled: false,
    filePath: generatedScreenshotPath
  })

  // Note: we are using https://example.com to do the test,
  // meaning that if the site is down, the test will fail
  // a better approach would be to use a local server to serve the content
  // but for the sake of simplicity, this should suffice for now
  const result = await exportPageHandler(undefined as any, {
    format: PageExporterFileFormat.PNG,
    url: 'https://example.com'
  })

  expect(result.ok).toBe('The screenshot was created successfully')
  expect(fs.existsSync(generatedScreenshotPath)).toBe(true)

  // Read the first 32 bytes of the file
  // On the first bytes, we should see the PNG header
  // the first bytes should contain the `50 4E 47` bytes which are the ASCII letters for 'PNG'
  const data = await readFile(generatedScreenshotPath, { start: 0, end: 32 })
  // check that the file is a valid .png file
  expect(data).toContain('PNG')
})

test('should generate a pdf file', async () => {
  const generatedScreenshotPath = join(__dirname, `/temp/test_screenshot_${genRandomStr()}.pdf`)

  // mock the dialog to return the path of the generated file
  mockDialog.showSaveDialog.mockResolvedValueOnce({
    canceled: false,
    filePath: generatedScreenshotPath
  })

  // Note: see the comment in the previous test
  const result = await exportPageHandler(undefined as any, {
    format: PageExporterFileFormat.PDF,
    url: 'https://example.com'
  })

  expect(result.ok).toBe('The screenshot was created successfully')
  expect(fs.existsSync(generatedScreenshotPath)).toBe(true)

  // Read the first 32 bytes of the file
  // On the first bytes, we should see the PDF header
  // This header should contain the string '%PDF'
  const data = await readFile(generatedScreenshotPath, { start: 0, end: 32 })
  // check that the file is a valid .pdf file
  expect(data).toContain('%PDF')
})

test(`should not save the file if the user didn't choose a file`, async () => {
  // The user canceled the dialog
  mockDialog.showSaveDialog.mockResolvedValueOnce({ canceled: true, filePath: '' })

  const result = await exportPageHandler(undefined as any, {
    format: PageExporterFileFormat.PNG,
    url: 'https://www.google.com'
  })

  expect(result.error).toBe(`The file wasn't saved`)
})
