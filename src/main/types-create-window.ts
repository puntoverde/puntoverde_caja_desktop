import {BrowserWindow} from 'electron'
export type createWindow={
    width?:number,
    height?: number, 
    frame?: boolean, 
    resizable?: boolean, 
    center?: boolean, 
    alwaysOnTop?: boolean, 
    backgroundColor?: string, 
    show?: boolean,
    parent?:BrowserWindow|undefined,
    modal?:boolean,

    url?:string
}