const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

ipcMain.handle("filePathPrompt", async (event, args) => {
    const { dialog } = require('electron')
    const result = await dialog.showSaveDialog({
        buttonLabel: 'Save Video',
        defaultPath: args
    });
    return result.filePath;
});

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    maximizable: false,
    resizable: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('Frontend/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})