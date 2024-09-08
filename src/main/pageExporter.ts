import { dialog } from 'electron'
import { PageExporterFileFormat, PageExporterParams } from '../preload/types'
import { to } from 'await-to-js'
import puppeteer from 'puppeteer'
import { join } from 'path'

export async function exportPageHandler(
  _event: Electron.IpcMainInvokeEvent,
  pageExporterParams: PageExporterParams
) {
  const defaultClientErrorMsg = 'We where unable to generate the image, please try again later'

  // Launch browser
  const [browserErr, browser] = await to(puppeteer.launch())
  if (browserErr) {
    console.error('Unable to launch browser', { browserErr, pageExporterParams })
    return { error: defaultClientErrorMsg }
  }

  // Create a new page
  const [pageErr, page] = await to(browser.newPage())
  if (pageErr) {
    console.error('Unable to create the new page', { pageErr, pageExporterParams })
    return { error: defaultClientErrorMsg }
  }

  // Go to the page
  const [gotoErr, _httpResponse] = await to(page.goto(pageExporterParams.url))
  if (gotoErr) {
    console.error('Unable to go to the url', { gotoErr, pageExporterParams })
    return { error: defaultClientErrorMsg }
  }

  // Ask the user where to save the file
  const [showSaveDialogErr, saveDialogReturnValue] = await to(
    dialog.showSaveDialog({
      defaultPath: join(__dirname, `/screenshot.${pageExporterParams.format}`)
    })
  )
  if (showSaveDialogErr) {
    console.error('Unable to get file path', { showSaveDialogErr, pageExporterParams })
    return { error: defaultClientErrorMsg }
  }
  const { canceled, filePath } = saveDialogReturnValue
  if (canceled) {
    return { error: `The file wasn't saved` }
  }

  // Take the screenshot and save it
  if (pageExporterParams.format === PageExporterFileFormat.PNG) {
    const [screenshotErr, _screenshotFileData] = await to(
      page.screenshot({
        path: filePath,
        type: 'png'
      })
    )
    if (screenshotErr) {
      console.error('Unable to take the screenshot', { screenshotErr, pageExporterParams })
      return { error: defaultClientErrorMsg }
    }
  } else if (pageExporterParams.format === PageExporterFileFormat.PDF) {
    const [pdfErr, _pdfFileData] = await to(page.pdf({ path: filePath }))
    if (pdfErr) {
      console.error('Unable to generate the pdf', { pdfErr, pageExporterParams })
      return { error: defaultClientErrorMsg }
    }
  }

  // Close the browser
  await browser.close()

  return { ok: 'ok' }
}
