/* 1.2.8 2023-12-16 16:49:20 - Incredibox - Designed with love & passion since 2009 */
const { machineId, machineIdSync } = require("node-machine-id"),
  {
    clipboard,
    ipcMain,
    app,
    BrowserWindow,
    Menu,
    dialog,
  } = require("electron"),
  path = require("path");
let mainWindow, menu;
var langJSON = {
  txt: { quitAppConfirm: "Do you really want to quit Incredibox?" },
  bt: { quit: "Quit", cancel: "Cancel" },
};
function createWindow() {
  (mainWindow = new BrowserWindow({
    title: "Incredibox",
    width: 1500,
    height: 900,
    minWidth: 500,
    minHeight: 300,
    titleBarStyle: "hidden",
    backgroundColor: "#000000",
    show: !1,
    fullscreen: !0,
    autoHideMenuBar: !0,
    webPreferences: {
      devTools: !1,
      enableRemoteModule: !0,
      nodeIntegration: !1,
      preload: path.join(__dirname, "elec-preload.js"),
    },
  })).webContents.on("devtools-opened", () => {
    mainWindow.webContents.closeDevTools();
  }),
    mainWindow.loadFile(path.join(__dirname, "index.html")),
    mainWindow.on("close", (e) => {
      app.quitting ||
        (e.preventDefault(),
        "darwin" === process.platform
          ? dialog
              .showMessageBox(mainWindow, {
                type: "question",
                title: "Confirm",
                buttons: [langJSON.bt.quit, langJSON.bt.cancel],
                cancelId: 1,
                defaultId: 0,
                message: langJSON.txt.quitAppConfirm,
              })
              .then((e) => {
                0 === e.response && (mainWindow.destroy(), app.quit());
              })
              .catch((e) => {})
          : (mainWindow.destroy(), app.quit()));
    }),
    mainWindow.once("ready-to-show", () => {
      null != mainWindow && mainWindow.show();
    }),
    mainWindow.on("closed", function () {});
}
function initGlobalVars() {
  (process.env.IS_FULLSCREENABLE = mainWindow.isFullScreenable()),
    (process.env.IS_MINIMIZABLE = mainWindow.isMinimizable()),
    (process.env.LANG = app.getLocale()),
    (process.env.UUID = machineIdSync({ original: !0 })),
    (process.env.ARG = app.commandLine.getSwitchValue("arg"));
}
function initIPC() {
  ipcMain.handle(
    "clipboard",
    (e, i) =>
      new Promise((e, n) => {
        clipboard.writeText(i),
          clipboard.readText() == i ? e() : n("clipboard bug");
      })
  ),
    ipcMain.on(
      "isFullScreen",
      (e) => (e.returnValue = mainWindow.isFullScreen())
    ),
    ipcMain.on("close", () => mainWindow.close()),
    ipcMain.on("enterFullScreen", () => mainWindow.setFullScreen(!0)),
    ipcMain.on("leaveFullScreen", () => mainWindow.setFullScreen(!1)),
    ipcMain.on("loadLang", (e, n) => {
      langJSON = n;
    }),
    ipcMain.on("openURL", (e, n) => {
      require("electron").shell.openExternal(n);
    }),
    ipcMain.on("minimize", () => {
      mainWindow.isFullScreen()
        ? (mainWindow.once("leave-full-screen", () => mainWindow.minimize()),
          mainWindow.setFullScreen(!1))
        : mainWindow.minimize();
    });
}
function buildMenu() {
  (menu = Menu.buildFromTemplate(myMenu)), Menu.setApplicationMenu(menu);
}
(app.name = "Incredibox"),
  app.on("ready", () => {
    createWindow(), initGlobalVars(), initIPC();
  }),
  app.on("activate", function () {
    null === mainWindow ? createWindow() : mainWindow.show();
  }),
  app.on("before-quit", () => {
    app.quitting = !0;
  }),
  app.on("window-all-closed", function () {});
const myMenu = [
  {
    role: "window",
    submenu: [
      { role: "zoom" },
      { role: "togglefullscreen" },
      { type: "separator" },
      { role: "minimize" },
      { role: "close" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "delete" },
      { role: "selectall" },
    ],
  },
];
"darwin" === process.platform &&
  myMenu.unshift({
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  });
