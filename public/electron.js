// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog} = require('electron');
const pathlib = require('path');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;
let baseOpenUrl = `file://${pathlib.join(__dirname, '../build/index.html')}#/`;
let openUrl = baseOpenUrl;

/* FUNCTIONS */
function createWindow () {
  /* CREATE WINDOW */
  mainWindow = new BrowserWindow({width: 938, height: 600, titleBarStyle: 'hiddenInset'});
  mainWindow.loadURL(openUrl);

  /* KEYBOARD */
  /*globalShortcut.register('CommandOrControl+S', () => {
    mainWindow.webContents.send('file-save')
  });
  globalShortcut.register('CommandOrControl+D', () => {
    mainWindow.webContents.send('switch-darkmode')
  })*/

  /* MENU */
  const menu = Menu.buildFromTemplate([
      {
        label: "Skripto",
        submenu: [
          {
            role:'quit',
            label:'Quit'
          }
        ]
      },
      {
        label: "File",
        submenu: [
          {
            role:'open',
            label:'Open file'
          },
          {
            role:'save',
            label:'Save file',
            click() {
              mainWindow.webContents.send('file-save')
            }
          }
        ]
      },
      {
        label:'View',
        submenu: [
          {
            role:'switch-darkmode',
            label:'Switch to Dark/Light mode',
            click() {
              mainWindow.webContents.send('switch-darkmode')
            }
          }
        ]
      }
  ]);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);

  /* WINDON EVENTS */
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  /* RENDERER EVENTS */
  ipcMain.on('newfile-choose', (event, arg) => {
      dialog.showOpenDialog({properties: ['openDirectory']}, (fp, bm) => {
        try {
          console.log(fp[0]);
          mainWindow.webContents.send('newfile-choose-reply', fp)
        } catch(e) {

        }
      });
    event.returnValue = 'pong';
  })
  ipcMain.on('openfile-choose', (event, arg) => {
    dialog.showOpenDialog({properties: ['openFile']}, (fp, bm) => {
      try {
        console.log(fp[0]);
        mainWindow.webContents.send('openfile-choose-reply', fp)
      } catch(e) {

      }
    });
    event.returnValue = 'pong';
  })
}

function openFile(event, pa) {
  openUrl = baseOpenUrl+"?file="+encodeURIComponent(pa);
  //TODO : open multiple files
  if (mainWindow === null) {
    createWindow()
  }
}


/* APP EVENTS */
app.on('open-file', openFile)
app.on('ready', createWindow)
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
