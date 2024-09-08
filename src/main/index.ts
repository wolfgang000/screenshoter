import { app, ipcMain } from 'electron'
import { IpcEvent } from '../preload/types'
import { onWindowAllClosed, whenReadyHandler } from './startupUtils'
import { exportPageHandler } from './pageExporter'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  whenReadyHandler()
  ipcMain.handle(IpcEvent.EXPORT_PAGE, exportPageHandler)
})

app.on('window-all-closed', onWindowAllClosed)
