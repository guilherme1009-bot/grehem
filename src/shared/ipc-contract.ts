import { ipcMain } from 'electron'
// This module intentionally contains only the public channel names used by the renderer.
export const ipcChannels = {
  tabs: ['tabs:list', 'tabs:create', 'tabs:close', 'tabs:activate', 'tabs:navigate', 'tabs:back', 'tabs:forward', 'tabs:reload', 'tabs:stop', 'tabs:reopen'],
  settings: ['settings:list', 'settings:set'],
  history: ['history:list', 'history:delete', 'history:clear'],
  bookmarks: ['bookmarks:list', 'bookmarks:find-by-url', 'bookmarks:create', 'bookmarks:delete'],
  folders: ['bookmark-folders:list', 'bookmark-folders:create'],
  searchEngines: ['search-engines:list', 'search-engines:set-default', 'search-engines:create', 'search-engines:delete']
} as const
export type IpcChannel = typeof ipcChannels[keyof typeof ipcChannels][number]
export function assertIpcChannel(channel: string): asserts channel is IpcChannel {
  if (!Object.values(ipcChannels).some((channels) => channels.includes(channel as never))) throw new Error(`Unsupported IPC channel: ${channel}`)
}
void ipcMain
