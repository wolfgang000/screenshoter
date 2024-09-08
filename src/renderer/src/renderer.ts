import { IpcEvent, PageExporterFileFormat, PageExporterParams } from "../../preload/types";

function getExporterParamsFromForm(form: HTMLFormElement): PageExporterParams {
  const data = new FormData(form);
  const url = data.get('url') as string;
  const formatRaw = data.get('format') as String;
  switch (formatRaw) { 
    case 'PDF': 
    case 'PNG': 
      break;
    default: 
      throw new Error('Invalid format');
  }

  const format = PageExporterFileFormat[formatRaw as keyof typeof PageExporterFileFormat]
  return { url, format };
}

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    function onSubmitPageExporterForm(event: Event) {
      event.preventDefault();
      const pageExporterParams = getExporterParamsFromForm(event.target as HTMLFormElement);
  
      window.electron.ipcRenderer.invoke(IpcEvent.EXPORT_PAGE, pageExporterParams).then((result) => {
        console.log(result);
      })
  
    }
    
    const pageExporterForm = document.getElementById("pageExporterForm");
    pageExporterForm!.addEventListener("submit", onSubmitPageExporterForm);
    doAThing()
  })
}

function doAThing(): void {
  const versions = window.electron.process.versions
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)

  const ipcHandlerBtn = document.getElementById('ipcHandler')
  ipcHandlerBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('ping')
  })
}

function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

init()
