const teamsWindow = document.getElementById('teams-app-window');
const teamsTitlebar = teamsWindow.querySelector('.teams-titlebar');
const clickChangeWallpaper = document.getElementById('changeWallpaper');

const wallpapers = [
    "url('https://images.unsplash.com/photo-1615969201429-ab6e06b58c79?w=600&auto=format&fit=crop&q=60')",
    "url('https://images.unsplash.com/photo-1562530898-ac9e536af7aa?w=600&auto=format&fit=crop&q=60')",
    "url('https://images.unsplash.com/photo-1653878096127-e5d290c067f1?w=600&auto=format&fit=crop&q=60')",
    "url('https://images.unsplash.com/photo-1647023662243-a9e26228f181?w=600&auto=format&fit=crop&q=60')"
];

let currentWallpaper = 0;
let topZ = 1000;
let folderCount = 1;
let draggingIcon = null;
let offsetX = 0, offsetY = 0;

// Initialize all functionalities
makeDraggable(teamsWindow, teamsTitlebar);
setupTogglePanel('#TaskBar-Start-Icon', '#start-menu');
setupTogglePanel('#TaskBar-Desktop-Icon', '#teams-app-window');
setupTogglePanel('#status-box', '#notification-panel');
setUpWindowControls(teamsWindow);
clickChangeWallpaper.addEventListener('click', changeWallpaper);
BrightnessAdjestment();
context_menubar();
newFolder();
destop_icon();
setUpIconContextMenu();
makeIconsDraggable();
updateClock();
setInterval(updateClock, 1000);

// Clock
function updateClock() {
    const clock = document.getElementById("clock");
    const date = document.getElementById("date");
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    date.textContent = now.toLocaleDateString('en-GB');
}

// Change Wallpaper
function changeWallpaper() {
    const desktop = document.getElementById('desktop');
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
    desktop.style.backgroundImage = wallpapers[currentWallpaper];
}

// Brightness Control
function BrightnessAdjestment() {
    const brightnessSlider = document.getElementById('brightnessSlider');
    const screenArea = document.getElementById('screen-area');
    brightnessSlider.addEventListener('input', () => {
        screenArea.style.filter = `brightness(${brightnessSlider.value}%)`;
    });
}

// Desktop vs Icon Context Menu
function context_menubar() {
    const desktopMenu = document.getElementById('contextMenu');
    const iconMenu = document.getElementById('iconContextMenu');
    const taskbar = document.getElementById('taskbar');
    const desktop = document.getElementById('desktop');

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();

        iconMenu.style.display = 'none';
        desktopMenu.style.display = 'none';

        if (taskbar.contains(e.target)) return;

        const icon = e.target.closest('.myAppIcon');
        if (icon) {
            iconMenu.style.top = `${e.pageY}px`;
            iconMenu.style.left = `${e.pageX}px`;
            iconMenu.style.zIndex = ++topZ;
            iconMenu.style.display = 'block';
            iconMenu.currentIcon = icon;
            return;
        }

        const isWindow = e.target.closest('.app-window');
        const isDesktop = desktop.contains(e.target);
        if (isDesktop && !isWindow) {
            desktopMenu.style.top = `${e.pageY}px`;
            desktopMenu.style.left = `${e.pageX}px`;
            desktopMenu.style.display = 'block';
            desktopMenu.style.zIndex = ++topZ;
        }
    });

    document.addEventListener('click', () => {
        document.getElementById('contextMenu').style.display = 'none';
        document.getElementById('iconContextMenu').style.display = 'none';
    });
}

// Make a window draggable
function makeDraggable(dragElement, handleElement) {
    let isDragging = false;

    handleElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - dragElement.offsetLeft;
        offsetY = e.clientY - dragElement.offsetTop;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        dragElement.style.left = `${e.clientX - offsetX}px`;
        dragElement.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = 'auto';
    });
}

// Toggle any panel
function setupTogglePanel(triggerSelector, panelSelector) {
    const trigger = document.querySelector(triggerSelector);
    const panel = document.querySelector(panelSelector);
    if (!trigger || !panel) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = window.getComputedStyle(panel).display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) panel.style.zIndex = ++topZ;
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== trigger) panel.style.display = 'none';
    });

    panel.addEventListener('click', e => e.stopPropagation());
}

// Window control buttons
function setUpWindowControls(windowElement) {
    const closeBtn = windowElement.querySelector('.close-btn');
    const minimizeBtn = windowElement.querySelector('.minimize-btn');
    const maximizeBtn = windowElement.querySelector('.maximize-btn');
    let isMaximized = false, prevPosition = {};

    closeBtn?.addEventListener('click', () => windowElement.style.display = 'none');
    minimizeBtn?.addEventListener('click', () => windowElement.style.display = 'none');

    maximizeBtn?.addEventListener('click', () => {
        if (!isMaximized) {
            prevPosition = {
                top: windowElement.style.top,
                left: windowElement.style.left,
                width: windowElement.style.width,
                height: windowElement.style.height,
                borderRadius: windowElement.style.borderRadius
            };
            Object.assign(windowElement.style, {
                top: '0', left: '0', width: '100vw', height: '100vh', borderRadius: '0'
            });
            isMaximized = true;
        } else {
            Object.assign(windowElement.style, prevPosition);
            isMaximized = false;
        }
    });

    windowElement.addEventListener('mousedown', () => {
        windowElement.style.zIndex = ++topZ;
    });
}

// Create new folder
function newFolder() {
    const newFolder = document.getElementById('newFolder');
    const desktopIcons = document.getElementById('desktop-icons');

    newFolder.addEventListener('click', () => {
        const newIcon = document.createElement('div');
        newIcon.className = 'icon myAppIcon';

        newIcon.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/128/3735/3735045.png" />
            <span contenteditable="true">New Folder ${folderCount}</span>
        `;
        folderCount++;
        desktopIcons.appendChild(newIcon);

        const span = newIcon.querySelector('span');
        span.focus();

        span.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                span.blur();
            }
        }, { once: true });

        span.addEventListener('blur', () => {
            if (span.textContent.trim() === '') {
                span.textContent = `New Folder ${folderCount - 1}`;
            }
            span.setAttribute('contenteditable', 'false');
        }, { once: true });

        addContextMenuListener(newIcon);
        addOpenListener(newIcon);
        makeIconsDraggable(); // Update for new icon
    });
}

// Initialize existing icons
function destop_icon() {
    document.querySelectorAll('.myAppIcon').forEach(icon => {
        addOpenListener(icon);
        addContextMenuListener(icon);
    });
}

// Double-click to open
function addOpenListener(icon) {
    icon.addEventListener('dblclick', () => {
        const name = icon.querySelector('span').textContent.trim();
        createAppWindow(name);
    });
}

// Context menu for icon
function addContextMenuListener(icon) {
    const menu = document.getElementById('iconContextMenu');
    icon.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menu.style.top = `${e.pageY}px`;
        menu.style.left = `${e.pageX}px`;
        menu.style.display = 'block';
        menu.style.zIndex = ++topZ;
        menu.currentIcon = icon;
    });
}

// Right-click menu actions
function setUpIconContextMenu() {
    const menu = document.getElementById('iconContextMenu');
    const openIcon = document.getElementById('openIcon');
    const renameIcon = document.getElementById('renameIcon');
    const deleteIcon = document.getElementById('deleteIcon');
    const propertiesIcon = document.getElementById('propertiesIcon');

    openIcon.addEventListener('click', () => {
        if (menu.currentIcon) {
            menu.currentIcon.dispatchEvent(new Event('dblclick'));
        }
    });

    renameIcon.addEventListener('click', () => {
        if (menu.currentIcon) {
            rename(menu.currentIcon.querySelector('span'));
        }
    });

    deleteIcon.addEventListener('click', () => {
        if (menu.currentIcon) menu.currentIcon.remove();
    });

    propertiesIcon.addEventListener('click', () => {
        if (menu.currentIcon) {
            const name = menu.currentIcon.querySelector('span').textContent.trim();
            alert(`Properties of: ${name}`);
        }
    });
}

// Rename icon logic
function rename(span) {
    span.setAttribute('contenteditable', 'true');
    span.focus();

    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
        }
    }, { once: true });

    span.addEventListener('blur', () => {
        if (span.textContent.trim() === '') {
            span.textContent = 'New Folder';
        }
        span.setAttribute('contenteditable', 'false');
    }, { once: true });
}

// Create new window
function createAppWindow(titletext) {
    const appWindow = document.createElement('div');
    appWindow.className = 'app-window';
    appWindow.style.top = '100px';
    appWindow.style.left = '100px';
    appWindow.style.zIndex = ++topZ;

    appWindow.innerHTML = `
        <div class='titlebar'>
            <span>${titletext}</span>
            <div class="controls">
                <span class="minimize-btn">🗕</span>
                <span class="maximize-btn">🗖</span>
                <span class="close-btn">✖</span>
            </div>
        </div>
        <div class="content"><p>Content of ${titletext}...</p></div>
    `;

    setUpWindowControls(appWindow);
    makeDraggable(appWindow, appWindow.querySelector('.titlebar'));
    document.getElementById('desktop').appendChild(appWindow);
}

// Draggable desktop icons
function makeIconsDraggable() {
    const icons = document.querySelectorAll('.myAppIcon');
    icons.forEach(icon => {
        if (icon.dataset.draggable === 'true') return;

        icon.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            draggingIcon = icon;
            offsetX = e.clientX - icon.offsetLeft;
            offsetY = e.clientY - icon.offsetTop;
            document.body.style.userSelect = 'none';
            icon.style.zIndex = ++topZ;
        });

        icon.dataset.draggable = 'true';
    });
}

document.addEventListener('mousemove', (e) => {
    if (!draggingIcon) return;
    draggingIcon.style.position = 'absolute';
    draggingIcon.style.left = `${e.clientX - offsetX}px`;
    draggingIcon.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', () => {
    if (draggingIcon) {
        draggingIcon = null;
        document.body.style.userSelect = 'auto';
    }
});