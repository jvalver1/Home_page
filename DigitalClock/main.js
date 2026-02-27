const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 400,
        backgroundColor: '#000000', // Matches your background so no white flash
        autoHideMenuBar: true,      // Hides the file menu
        icon: __dirname + '/icon.ico', // Optional: if you have an icon
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load your clock file
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});