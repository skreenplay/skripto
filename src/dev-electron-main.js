const {app, BrowserWindow, globalShortcut, Menu} = require('electron')

/* GLOBAL VALUES */
let mainWindow

/* FUNCTIONS */
function createWindow () {
  /* CREATE WINDOW */
  mainWindow = new BrowserWindow({width: 938, height: 600, titleBarStyle: 'hiddenInset'})
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

  /* WINDOW EVENTS */
  mainWindow.on('closed', function () {
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
