const {app, BrowserWindow, globalShortcut, Menu, dialog, ipcMain, remote} = require('electron');
const process = require('process');
const fs = require('fs');
const pathlib = require('path');


/* GLOBAL VALUES */
let mainWindow
var baseUserConfig = {
  ui_lightmode : false,
  ui_width:1048,
  ui_height:600
}
let userConfig;

/* Get User Config */
const usrDir = app.getPath('userData');
const usrFilePath = pathlib.join(usrDir, 'skriptoconfig.json');

getUserConfig();

/* User Config Functions */
function getUserConfig() {
  if (fs.existsSync(usrFilePath)) {
    userConfig = JSON.parse(fs.readFileSync(usrFilePath));
  } else {
    userConfig = baseUserConfig;
    fs.writeFileSync(usrFilePath, JSON.stringify(userConfig), function(e) {
    console.log("Error trying to write config file");
    });
  }
}
function saveUserConfig() {
  fs.writeFileSync(usrFilePath, JSON.stringify(userConfig));
}
/* Plugin Functions */
function getPlugins() {
  var pluginTree = {
    Toolbar: [

    ],
    Editor: [

    ],
    Global: [

    ]
  }
  var pluginsPath = pathlib.join(process.resourcesPath, "plugins/")
  var pluginsPath = pathlib.join("/Users/markspurgeon/Desktop/skripto/skripto", "plugins/")

  fs.readdirSync(pluginsPath).forEach(function(folder) {
    if (folder!==".DS_Store"){
      var plPlugin = pathlib.join(pluginsPath, folder, 'plugin/');

      if (fs.existsSync(plPlugin)){
        fs.readdirSync(plPlugin).forEach(function(item) {
          if (item==="manifest.json") {
            var manifestFile = pathlib.join(plPlugin, item)
            config = JSON.parse(fs.readFileSync(manifestFile));
            if (config.where) {
              var newPlugin = config;
              newPlugin.path = pathlib.join(plPlugin,"plugin.js")
              pluginTree[config.where].push(newPlugin);
            }

          }
        });
      }
    }
  });
  return pluginTree
}

/* UI Config Functions */
function ui_switchLightMode() {
  if (userConfig.ui_lightmode===true) {
    userConfig.ui_lightmode=false
  } else {
    userConfig.ui_lightmode=true
  }
  saveUserConfig()
  mainWindow.webContents.send('config-ui', JSON.stringify(userConfig))
}

/* Window Functions */
function createWindow () {

  /* CREATE WINDOW */
  mainWindow = new BrowserWindow({width: userConfig.ui_width, height: userConfig.ui_height, titleBarStyle: 'hiddenInset', show:false})
  const startUrl = "http://localhost:3505/#/"+"?config="+JSON.stringify(userConfig);
  mainWindow.loadURL(startUrl);
  //fs.writeFileSync('/Users/markspurgeon/Desktop/userconfig.json', startUrl);

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
            role:'config-ui-lightmode',
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
                label:'Character (§C)',
                accelerator:'CommandOrControl+2',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§C')
                }
              },
              {
                role:'item-type-change-dialog',
                label:'Dialog (§D)',
                accelerator:'CommandOrControl+3',
                click() {
                  mainWindow.webContents.send('edit-itemtype', '§D')
                }
              },
              {
                role:'item-type-change-paragraph',
                label:'Paragraph (§P)',
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



  /* WINDOW EVENTS */
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    /* set up ui, doesn't really need to be there though */
    mainWindow.webContents.send('config-ui',JSON.stringify(userConfig));
    /* send the plugin tree */
    var plConfig = getPlugins()
    mainWindow.webContents.send('plugins:update',JSON.stringify(plConfig));
  })
  mainWindow.on('closed', function () {
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
