import {
  IpcEvent,
  PageExporterFileFormat,
  PageExporterParams,
  PageExporterResponse
} from '../../preload/types'

function getExporterParamsFromForm(form: HTMLFormElement): PageExporterParams {
  const data = new FormData(form)
  const url = data.get('url') as string
  const formatRaw = data.get('format') as String
  switch (formatRaw) {
    case 'PDF':
    case 'PNG':
      break
    default:
      throw new Error('Invalid format')
  }

  const format = PageExporterFileFormat[formatRaw as keyof typeof PageExporterFileFormat]
  return { url, format }
}

function onSubmitPageExporterFormHandler(event: Event) {
  event.preventDefault()
  const submitBtnElement = document.querySelector<HTMLButtonElement>("button[type='submit']")
  if (submitBtnElement) {
    submitBtnElement.disabled = true
    submitBtnElement.innerText = 'Taking the screenshot...'
  }

  const pageExporterParams = getExporterParamsFromForm(event.target as HTMLFormElement)

  window.electron.ipcRenderer
    .invoke(IpcEvent.EXPORT_PAGE, pageExporterParams)
    .then((result: PageExporterResponse) => {
      if (result.error) {
        alert(result.error)
      } else {
        alert(result.ok)
      }
    })
    .finally(() => {
      if (submitBtnElement) {
        submitBtnElement.disabled = false
        submitBtnElement.innerText = 'Take a screenshot'
      }
    })
}

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const pageExporterForm = document.getElementById('pageExporterForm')
    pageExporterForm!.addEventListener('submit', onSubmitPageExporterFormHandler)
  })
}

init()
