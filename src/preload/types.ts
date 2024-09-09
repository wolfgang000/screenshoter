export enum PageExporterFileFormat {
  PDF = 'pdf',
  PNG = 'png'
}

export interface PageExporterParams {
  url: string
  format: PageExporterFileFormat
}

export interface PageExporterResponse {
  ok?: string
  error?: string
}

export enum IpcEvent {
  EXPORT_PAGE = 'EXPORT_PAGE'
}
