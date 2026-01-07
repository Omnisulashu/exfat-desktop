const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (isDev) {
    // 🔥 DEV MODE → React dev server
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // ✅ PROD MODE → build React
    mainWindow.loadFile(path.join(__dirname, "fat/build/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  // 🚫 auto-update UNIQUEMENT en PROD
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update available",
    message: "A new version of EXFAT is available.\nIt will be downloaded automatically.",
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "question",
    title: "Install update",
    message: "The update has been downloaded.\nRestart EXFAT now to install it?",
    buttons: ["Restart", "Later"],
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});