// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const pathlib = require('path');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;
let baseOpenUrl = `file://${pathlib.join(__dirname, '../build/index.html')}#/`;
let openUrl = baseOpenUrl;


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 938, height: 600, titleBarStyle: 'hiddenInset'});
  mainWindow.loadURL(openUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function openFile(event, pa) {
  openUrl = baseOpenUrl+"?file="+encodeURIComponent(pa);
  //TODO : open multiple files
  event.sender.send('file-save', 'pong');
  if (mainWindow === null) {
    createWindow()
  }
}

app.on('open-file', openFile)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
