const {app, BrowserWindow, globalShortcut, Menu, dialog, ipcMain} = require('electron')

/* GLOBAL VALUES */
let mainWindow

/* FUNCTIONS */
function createWindow () {
  /* CREATE WINDOW */
  mainWindow = new BrowserWindow({width: 1048, height: 600, titleBarStyle: 'hiddenInset'})
  const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });
  mainWindow.loadURL(startUrl)
  //mainWindow.loadFile('../build/index.html')

  /* DEV TOOLS */
  mainWindow.webContents.openDevTools();

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
            accelerator:'CommandOrControl+S',
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
            accelerator:'CommandOrControl+L',
            click() {
              mainWindow.webContents.send('switch-darkmode')
            }
          }
        ]
      }
  ]);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);


  /* WINDOW EVENTS */
  mainWindow.on('closed', function () {
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
  event.sender.send('file-save', 'pong');
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
