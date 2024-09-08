export enum PageExporterFileFormat {
    PDF = 'pdf',
    PNG = 'png',
}

export interface PageExporterParams {
    url: string;
    format: PageExporterFileFormat;
}

export enum IpcEvent {
    EXPORT_PAGE = 'EXPORT_PAGE',
}