// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog} = require('electron');
const pathlib = require('path');
const url = require('url');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
var baseUserConfig = {
  ui_lightmode : false,
  ui_width:1048,
  ui_height:600
};
let userConfig;
const usrDir = app.getPath('userData');
const usrFilePath = pathlib.join(usrDir, 'skriptoconfig.json');

getUserConfig();

let baseOpenUrl = `file://${pathlib.join(__dirname, '../build/index.html')}#/`;
let openUrl = baseOpenUrl+"?config="+JSON.stringify(userConfig);

function getUserConfig() {
  if (fs.existsSync(usrFilePath)) {
    userConfig = JSON.parse(fs.readFileSync(usrFilePath));
  } else {
    userConfig = baseUserConfig;
    saveUserConfig()
  }
}
function saveUserConfig() {
  fs.writeFileSync(usrFilePath, JSON.stringify(userConfig));
}

/* UI Config Functions */
function ui_switchLightMode() {
  if (userConfig.ui_lightmode===true) {
    userConfig.ui_lightmode=false
  } else {
    userConfig.ui_lightmode=true
  }
  saveUserConfig()
  mainWindow.webContents.send('config', JSON.stringify(userConfig))
}

/* FUNCTIONS */
function createWindow () {
  /* CREATE WINDOW */
  mainWindow = new BrowserWindow({width: userConfig.ui_width, height: userConfig.ui_height, titleBarStyle: 'hiddenInset', backgroundColor: '#F1EDE5', show:false});
  mainWindow.loadURL(openUrl);
  /*mainWindow.webContents.openDevTools();*/

  /* MENU */
  const menu = Menu.buildFromTemplate([
      {
        label: "Skripto",
        submenu: [
          {
            role:'quit',
            accelerator:'CommandOrControl+Q',
            label:'Quit'
          }
        ]
      },
      {
        label: "File",
        submenu: [
          {
            role:'open',
            label:'Open file',
            accelerator:'CommandOrControl+O',
            click() {
              mainWindow.webContents.send('file-open-new')
            }
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
              ui_switchLightMode()
            }
          }
        ]
      },
      {
        label:'Edit',
        submenu: [
          {
            role:'item-type-change',
            label:'Set Item Type to...',
            submenu: [
              {
                role:'item-type-change-scene',
                label:'Scene (§S)',
                accelerator:'CommandOrControl+1',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§S')
                }
              },
              {
                role:'item-type-change-character',
                label:'Scene (§C)',
                accelerator:'CommandOrControl+2',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§C')
                }
              },
              {
                role:'item-type-change-dialog',
                label:'Scene (§D)',
                accelerator:'CommandOrControl+3',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§D')
                }
              },
              {
                role:'item-type-change-paragraph',
                label:'Scene (§P)',
                accelerator:'CommandOrControl+4',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§P')
                }
              }
            ]
          }
        ]
      }
  ]);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);

  /* WINDON EVENTS */
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('config',JSON.stringify(userConfig));
  })
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
  mainWindow.on('resize', function () {
    let { width, height } = mainWindow.getBounds();
    userConfig.ui_width = width;
    userConfig.ui_height = height;
    saveUserConfig();
  })

}

function openFile(event, pa) {
  openUrl = baseOpenUrl+"?file="+encodeURIComponent(pa)+"&light="+userConfig.ui_lightmode;
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

ipcMain.on('set-config-ui-lightmode', (event, arg) => {
    userConfig.ui_lightmode = arg;
    saveUserConfig()
    event.returnValue = 'pong';
})
