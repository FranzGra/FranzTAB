document.addEventListener('DOMContentLoaded', async () => {
  // Elementi DOM
  const root = document.documentElement;
  const backgroundEl = document.getElementById('background');
  const mainGrid = document.getElementById('grid');

  // Folder View
  const folderView = document.getElementById('folder-view');
  const folderGrid = document.getElementById('folder-grid');
  const folderTitle = document.getElementById('folder-title');
  const closeFolderBtn = document.getElementById('close-folder-btn');

  // Modale Aggiungi/Modifica
  const addDialog = document.getElementById('add-dialog');
  const addForm = document.getElementById('add-form');
  const cancelAddBtn = document.getElementById('cancel-add-btn');
  const deleteItemBtn = document.getElementById('delete-item-btn');
  const itemNameInput = document.getElementById('item-name');
  const itemUrlInput = document.getElementById('item-url');
  const typeRadios = document.getElementsByName('item-type');
  const urlGroup = document.getElementById('url-group');
  const addFolderLabel = document.getElementById('add-folder-label');
  const dialogTitle = document.getElementById('dialog-title');
  const typeToggleContainer = document.getElementById('type-toggle-container');

  // Modale - Icone Personalizzate
  const itemCustomIconInput = document.getElementById('item-custom-icon');
  const iconUploadBox = document.getElementById('icon-upload-box');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const customIconImg = document.getElementById('custom-icon-img');
  const removeCustomIconBtn = document.getElementById('remove-custom-icon-btn');

  // Sidebar Impostazioni
  const settingsBtn = document.getElementById('settings-btn');
  const settingsSidebar = document.getElementById('settings-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

  // Sfondo
  const bgUploadInput = document.getElementById('bg-upload');
  const uploadBgBtn = document.getElementById('upload-bg-btn');
  const bgImageSettings = document.getElementById('bg-image-settings');
  const bgBrightnessSlider = document.getElementById('bg-brightness-slider');
  const bgBrightnessVal = document.getElementById('bg-brightness-val');
  const bgBlurSlider = document.getElementById('bg-blur-slider');
  const bgBlurVal = document.getElementById('bg-blur-val');

  const bgColorPicker = document.getElementById('bg-color-picker');
  const colorSwatches = document.querySelectorAll('.color-swatch[data-color]:not(.box-color-swatch)');

  // Sliders Settings
  const iconSizeSlider = document.getElementById('icon-size-slider');
  const colsSlider = document.getElementById('cols-slider');
  const rowsSlider = document.getElementById('rows-slider');
  const gapXSlider = document.getElementById('gap-x-slider');
  const gapYSlider = document.getElementById('gap-y-slider');

  const iconSizeVal = document.getElementById('icon-size-val');
  const colsVal = document.getElementById('cols-val');
  const rowsVal = document.getElementById('rows-val');
  const gapXVal = document.getElementById('gap-x-val');
  const gapYVal = document.getElementById('gap-y-val');

  // Pulsanti Rapidi & Dati
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importJsonInput = document.getElementById('import-json');

  // Stato
  let bookmarks = [];
  let currentFolderId = null;
  let editingItemId = null;
  let currentCustomIcon = null;
  let draggedItemEl = null;

  // Valori predefiniti di ogni impostazione: unica fonte di verità, usata sia
  // all'avvio sia dall'esportazione. Serve perché chrome.storage restituisce
  // solo le chiavi già scritte: un'opzione mai toccata dall'utente non esiste
  // nello storage e, senza questa tabella, finirebbe fuori dal backup.
  const SETTING_DEFAULTS = {
    background: null,
    bgColor: null,
    iconSize: 64,
    iconRadius: 22,
    innerIconScale: 50,
    gridCols: 6,
    gridRows: 3,
    gapX: 20,
    gapY: 20,
    folderCols: 4,
    folderRows: 3,
    bgDarkness: 0,
    bgBlur: 0,
    alignY: 'center',
    // Stile Box Avanzato
    themeMode: 'auto',
    boxMode: 'box',
    boxBgStyle: 'glass',
    boxColor: '#ffffff',
    boxOpacity: 20,
    boxBorderWidth: 1,
    boxBorderColor: '#ffffff',
    boxBorderOpacity: 30,
    boxShadowBlur: 12,
    boxShadowOpacity: 10,
    boxHoverScale: 1.05,
    boxHoverLift: 0,
    showTitle: true,
    titleFontSize: 12
  };

  let iconSize = SETTING_DEFAULTS.iconSize;
  let iconRadius = SETTING_DEFAULTS.iconRadius;
  let innerIconScale = SETTING_DEFAULTS.innerIconScale;
  let gridCols = SETTING_DEFAULTS.gridCols;
  let gridRows = SETTING_DEFAULTS.gridRows;
  let gapX = SETTING_DEFAULTS.gapX;
  let gapY = SETTING_DEFAULTS.gapY;
  let folderCols = SETTING_DEFAULTS.folderCols;
  let folderRows = SETTING_DEFAULTS.folderRows;
  let bgDarkness = SETTING_DEFAULTS.bgDarkness;
  let bgBlur = SETTING_DEFAULTS.bgBlur;
  let alignY = SETTING_DEFAULTS.alignY;

  // NUOVO: Stile Box Avanzato
  let themeMode = SETTING_DEFAULTS.themeMode;
  let boxMode = SETTING_DEFAULTS.boxMode;
  let boxBgStyle = SETTING_DEFAULTS.boxBgStyle;
  let boxColor = SETTING_DEFAULTS.boxColor;
  let boxOpacity = SETTING_DEFAULTS.boxOpacity;
  let boxBorderWidth = SETTING_DEFAULTS.boxBorderWidth;
  let boxBorderColor = SETTING_DEFAULTS.boxBorderColor;
  let boxBorderOpacity = SETTING_DEFAULTS.boxBorderOpacity;
  let boxShadowBlur = SETTING_DEFAULTS.boxShadowBlur;
  let boxShadowOpacity = SETTING_DEFAULTS.boxShadowOpacity;
  let boxHoverScale = SETTING_DEFAULTS.boxHoverScale;
  let boxHoverLift = SETTING_DEFAULTS.boxHoverLift;
  let showTitle = SETTING_DEFAULTS.showTitle;
  let titleFontSize = SETTING_DEFAULTS.titleFontSize;

  // Funzione per aggiornare l'estetica degli slider Shadcn/UI
  const updateSliderTrack = (slider) => {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--value', `${percentage}%`);
  };

  // Utilities
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getFavicon = (url) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  const getFaviconPool = (url) => {
    try {
      const urlObj = new URL(url);
      const h = urlObj.hostname;
      return [
        `https://www.google.com/s2/favicons?domain=${h}&sz=256`,
        `https://logo.clearbit.com/${h}`,
        `https://icon.horse/icon/${h}`,
        `https://api.faviconkit.com/${h}/144`,
        `https://icons.duckduckgo.com/ip3/${h}.ico`,
        `https://www.google.com/s2/favicons?domain=${h}&sz=128`,
        `https://www.google.com/s2/favicons?domain=${h}&sz=64`
      ];
    } catch (e) {
      return [];
    }
  };

  // Nomi e URL finiscono dentro template HTML costruiti a mano: senza
  // escaping un apice chiude l'attributo e il resto del nome viene letto
  // come markup (un nome tipo «Ricerca "avanzata"» rompe il riquadro, e un
  // backup di provenienza ignota potrebbe iniettare un onmouseover).
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Negli href si accettano solo schemi navigabili: blocca javascript: e simili.
  const safeUrl = (url) => {
    const raw = String(url ?? '').trim();
    try {
      const parsed = new URL(raw, location.href);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return raw;
    } catch (e) { /* URL non interpretabile */ }
    return '#';
  };

  // Per le icone sono leciti anche i data: URL, che è come vengono salvate
  // le icone personalizzate nei backup.
  const safeIconSrc = (src) => {
    const raw = String(src ?? '').trim();
    if (/^data:image\//i.test(raw)) return raw;
    try {
      const parsed = new URL(raw, location.href);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return raw;
    } catch (e) { /* URL non interpretabile */ }
    return '';
  };

  // ===== BADGE OFFLINE =====
  const offlineBadge = document.getElementById('offline-badge');
  const updateOnlineStatus = () => {
    offlineBadge.classList.toggle('hidden', navigator.onLine);
  };
  window.addEventListener('online', () => { updateOnlineStatus(); render(); });
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  const offlineDialog = document.getElementById('offline-dialog');
  offlineBadge.addEventListener('click', () => offlineDialog.showModal());
  document.getElementById('close-offline-btn').addEventListener('click', () => closeDialogAnimated(offlineDialog));
  offlineDialog.addEventListener('click', (e) => {
    if (e.target === offlineDialog) closeDialogAnimated(offlineDialog);
  });

  // ===== CACHE OFFLINE DELLE ICONE =====
  // Le icone automatiche sono URL remoti (Google, DuckDuckGo...): senza rete
  // non si caricano. Ogni icona remota viene scaricata una volta, convertita
  // in data: URL e salvata in storage.local, così la pagina resta completa
  // anche offline. Finché l'icona non è in cache si usa l'URL remoto.
  let iconCache = {};
  const iconFetchPending = new Set();
  let iconCacheRenderTimer = null;

  const fetchIconAsDataUrl = (url) => new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ type: 'fetchImage', url }, (res) => {
        if (chrome.runtime.lastError || !res || res.error || !res.dataUrl) return resolve(null);
        resolve(/^data:image\//i.test(res.dataUrl) ? res.dataUrl : null);
      });
    } catch (e) {
      resolve(null);
    }
  });

  const cachedIconSrc = (src) => {
    if (!src || /^data:/i.test(src)) return src;
    if (iconCache[src]) return iconCache[src];
    if (navigator.onLine && !iconFetchPending.has(src)) {
      iconFetchPending.add(src);
      fetchIconAsDataUrl(src).then(async (dataUrl) => {
        iconFetchPending.delete(src);
        if (!dataUrl) return;
        iconCache[src] = dataUrl;
        try { await chrome.storage.local.set({ iconCache }); } catch (e) { /* quota: resta in memoria */ }
        // Un solo re-render per un gruppo di icone arrivate insieme.
        clearTimeout(iconCacheRenderTimer);
        iconCacheRenderTimer = setTimeout(() => render(), 300);
      });
    }
    return src;
  };

  // Elimina dalla cache le icone non più usate da nessun collegamento.
  const pruneIconCache = async () => {
    const used = new Set();
    const collect = (items) => (items || []).forEach(it => {
      if (it.type === 'folder') return collect(it.children);
      if (it.autoIcon) used.add(it.autoIcon);
      const fav = getFavicon(it.url);
      if (fav) used.add(fav);
    });
    collect(bookmarks);
    let changed = false;
    Object.keys(iconCache).forEach(k => { if (!used.has(k)) { delete iconCache[k]; changed = true; } });
    if (changed) { try { await chrome.storage.local.set({ iconCache }); } catch (e) { /* ignora */ } }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const closeDialogAnimated = (dialog) => {
    dialog.classList.add('closing');
    dialog.addEventListener('animationend', function handler() {
      dialog.classList.remove('closing');
      dialog.close();
      dialog.removeEventListener('animationend', handler);
    });
  };

  const findItemContext = (id) => {
    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].id === id) return { item: bookmarks[i], parentArray: bookmarks };
      if (bookmarks[i].type === 'folder' && bookmarks[i].children) {
        for (let j = 0; j < bookmarks[i].children.length; j++) {
          if (bookmarks[i].children[j].id === id) return { item: bookmarks[i].children[j], parentArray: bookmarks[i].children };
        }
      }
    }
    return { item: null, parentArray: null };
  };

  // 1. Inizializzazione e Storage
  const init = async () => {
    try {
      // null = tutte le chiavi presenti nello storage, così una chiave nuova
      // (o ripristinata da un backup) non va persa per una lista non aggiornata.
      const localData = await chrome.storage.local.get(null);

      if (!localData.migrated) {
        const syncData = await chrome.storage.sync.get({ bookmarks: [] });
        if (syncData.bookmarks && syncData.bookmarks.length > 0) {
          const migratedBookmarks = syncData.bookmarks.map(bm => ({
            id: generateId(), type: 'link', name: bm.name, url: bm.url
          }));
          await chrome.storage.local.set({ bookmarks: migratedBookmarks, migrated: true });
          bookmarks = migratedBookmarks;
        } else {
          bookmarks = localData.bookmarks || [];
          await chrome.storage.local.set({ migrated: true });
        }
      } else {
        bookmarks = localData.bookmarks || [];
      }

      if (localData.iconCache && typeof localData.iconCache === 'object') iconCache = localData.iconCache;
      if (localData.iconSize !== undefined) iconSize = localData.iconSize;
      if (localData.iconRadius !== undefined) iconRadius = localData.iconRadius;
      if (localData.innerIconScale !== undefined) innerIconScale = localData.innerIconScale;
      if (localData.gridCols !== undefined) gridCols = localData.gridCols;
      if (localData.gridRows !== undefined) gridRows = localData.gridRows;
      if (localData.gapX !== undefined) gapX = localData.gapX;
      if (localData.gapY !== undefined) gapY = localData.gapY;
      if (localData.folderCols !== undefined) folderCols = localData.folderCols;
      if (localData.folderRows !== undefined) folderRows = localData.folderRows;
      if (localData.bgDarkness !== undefined) bgDarkness = localData.bgDarkness;
      if (localData.bgBlur !== undefined) bgBlur = localData.bgBlur;
      if (localData.alignY !== undefined) alignY = localData.alignY;

      // NUOVO: carica stili box
      if (localData.themeMode !== undefined) themeMode = localData.themeMode;
      if (localData.boxMode !== undefined) boxMode = localData.boxMode;
      if (localData.boxBgStyle !== undefined) boxBgStyle = localData.boxBgStyle;
      if (localData.boxColor !== undefined) boxColor = localData.boxColor;
      if (localData.boxOpacity !== undefined) boxOpacity = localData.boxOpacity;
      if (localData.boxBorderWidth !== undefined) boxBorderWidth = localData.boxBorderWidth;
      if (localData.boxBorderColor !== undefined) boxBorderColor = localData.boxBorderColor;
      if (localData.boxBorderOpacity !== undefined) boxBorderOpacity = localData.boxBorderOpacity;
      if (localData.boxShadowBlur !== undefined) boxShadowBlur = localData.boxShadowBlur;
      if (localData.boxShadowOpacity !== undefined) boxShadowOpacity = localData.boxShadowOpacity;
      if (localData.boxHoverScale !== undefined) boxHoverScale = localData.boxHoverScale;
      if (localData.boxHoverLift !== undefined) boxHoverLift = localData.boxHoverLift;
      if (localData.showTitle !== undefined) showTitle = localData.showTitle;
      if (localData.titleFontSize !== undefined) titleFontSize = localData.titleFontSize;

      if (localData.bgColor) {
        bgColorPicker.value = localData.bgColor;
      }

      applySettings();

      if (localData.background) {
        applyBackgroundImage(localData.background);
      } else if (localData.bgColor) {
        applyBackgroundColor(localData.bgColor);
      }

      render();
      pruneIconCache();

    } catch (error) {
      console.error("Errore durante l'inizializzazione:", error);
    }
  };

  const saveBookmarks = async () => {
    await chrome.storage.local.set({ bookmarks });
  };

  // ===== CONTRASTO DINAMICO SULLO SFONDO =====
  // I titoli dei collegamenti stanno direttamente sopra lo sfondo scelto
  // dall'utente, non sopra una superficie del tema. Legarli al tema li rende
  // illeggibili nei casi misti (tema scuro + sfondo bianco = bianco su
  // bianco), quindi il colore va deciso dalla luminosità reale dello sfondo.
  let currentBg = { type: 'color', value: null };
  let cachedBgSrc = null;
  let cachedBgAvg = null;

  const relLuminance = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  // Sopra questa luminanza il testo nero contrasta più del bianco: è il punto
  // esatto in cui i due rapporti di contrasto si equivalgono.
  const LUMINANCE_CROSSOVER = 0.179;

  const cssColorToRgb = (color) => {
    if (/^#?[a-f\d]{6}$/i.test(String(color).trim())) return hexToRgb(color);
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    probe.style.color = color;
    document.body.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g);
    probe.remove();
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 255, g: 255, b: 255 };
  };

  // Colore medio dell'immagine, campionata in piccolo: serve solo la
  // luminosità complessiva, non il dettaglio.
  const averageColorOfImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const N = 32;
        const canvas = document.createElement('canvas');
        canvas.width = N;
        canvas.height = N;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, N, N);
        const d = ctx.getImageData(0, 0, N, N).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        resolve({ r: r / n, g: g / n, b: b / n });
      } catch (e) {
        resolve(null); // canvas non leggibile: si ricade sul colore di sfondo
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const updateBackgroundContrast = async () => {
    let avg = null;
    if (currentBg.type === 'image' && currentBg.value) {
      if (currentBg.value === cachedBgSrc) {
        avg = cachedBgAvg;
      } else {
        avg = await averageColorOfImage(currentBg.value);
        cachedBgSrc = currentBg.value;
        cachedBgAvg = avg;
      }
    }
    if (!avg) {
      const fallback = (currentBg.type === 'color' && currentBg.value)
        ? currentBg.value
        : getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
      avg = cssColorToRgb(fallback || '#ffffff');
    }

    // brightness() moltiplica i canali: senza tenerne conto uno sfondo chiaro
    // molto oscurato verrebbe ancora classificato come chiaro.
    const k = 1 - (bgDarkness / 100);
    const eff = { r: avg.r * k, g: avg.g * k, b: avg.b * k };
    const bgIsLight = relLuminance(eff) > LUMINANCE_CROSSOVER;
    document.body.classList.toggle('bg-is-light', bgIsLight);
    document.body.classList.toggle('bg-is-dark', !bgIsLight);

    // Il riquadro dell'icona ha colore e opacità propri: la lettera al suo
    // interno deve contrastare con il riquadro composito, non con lo sfondo.
    const boxRgb = hexToRgb(boxColor);
    const alpha = (boxMode === 'icon-only' || boxBgStyle === 'transparent')
      ? 0
      : boxOpacity / 100;
    const onBoxBg = {
      r: boxRgb.r * alpha + eff.r * (1 - alpha),
      g: boxRgb.g * alpha + eff.g * (1 - alpha),
      b: boxRgb.b * alpha + eff.b * (1 - alpha)
    };
    const boxIsLight = relLuminance(onBoxBg) > LUMINANCE_CROSSOVER;
    document.body.classList.toggle('box-is-light', boxIsLight);
    document.body.classList.toggle('box-is-dark', !boxIsLight);
  };

  const applyBackgroundImage = (bgData) => {
    backgroundEl.style.backgroundImage = `url(${bgData})`;
    bgImageSettings.style.display = 'block';
    currentBg = { type: 'image', value: bgData };
    updateBackgroundContrast();
  };

  const applyBackgroundColor = (color) => {
    backgroundEl.style.backgroundImage = 'none';
    // Va impostata su <body>, non su <html>: ogni blocco di tema ridichiara
    // --bg-color su body, quindi un valore messo su <html> viene sempre
    // oscurato per i discendenti e la tinta unita non si vedeva.
    document.body.style.setProperty('--bg-color', color);
    bgImageSettings.style.display = 'none';
    currentBg = { type: 'color', value: color };
    updateBackgroundContrast();
  };

  const applySettings = () => {
    // Tema
    document.body.classList.remove('theme-light', 'theme-dark');
    if (themeMode === 'light') document.body.classList.add('theme-light');
    else if (themeMode === 'dark') document.body.classList.add('theme-dark');

    // Box mode
    document.body.classList.remove('box-mode-icon-only');
    if (boxMode === 'icon-only') document.body.classList.add('box-mode-icon-only');

    // Show title
    document.body.classList.remove('hide-title');
    if (!showTitle) document.body.classList.add('hide-title');

    // Box colors
    const rgb = hexToRgb(boxColor);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${boxOpacity / 100})`;

    if (boxBgStyle === 'transparent') {
      root.style.setProperty('--box-bg', 'transparent');
      root.style.setProperty('--box-backdrop', 'none');
    } else if (boxBgStyle === 'solid') {
      root.style.setProperty('--box-bg', bgRgba);
      root.style.setProperty('--box-backdrop', 'none');
    } else {
      root.style.setProperty('--box-bg', bgRgba);
      root.style.setProperty('--box-backdrop', 'blur(10px)');
    }

    const borderRgb = hexToRgb(boxBorderColor);
    root.style.setProperty('--box-border-color', `rgba(${borderRgb.r}, ${borderRgb.g}, ${borderRgb.b}, ${boxBorderOpacity / 100})`);
    root.style.setProperty('--box-border-width', `${boxBorderWidth}px`);
    root.style.setProperty('--box-shadow-blur', `${boxShadowBlur}px`);
    root.style.setProperty('--box-shadow-opacity', (boxShadowOpacity / 100).toString());
    root.style.setProperty('--box-hover-scale', boxHoverScale.toString());
    root.style.setProperty('--box-hover-lift', `${boxHoverLift}px`);
    root.style.setProperty('--title-font-size', titleFontSize.toString());

    // Grid & Icon
    const maxRadius = Math.floor(iconSize / 2);
    if (iconRadius > maxRadius) {
      iconRadius = maxRadius;
      chrome.storage.local.set({ iconRadius });
    }

    root.style.setProperty('--icon-size', `${iconSize}px`);
    root.style.setProperty('--radius', `${iconRadius}px`);
    root.style.setProperty('--inner-icon-scale', `${innerIconScale}%`);
    root.style.setProperty('--grid-cols', gridCols);
    root.style.setProperty('--grid-gap-x', `${gapX}px`);
    root.style.setProperty('--grid-gap-y', `${gapY}px`);
    root.style.setProperty('--folder-grid-cols', folderCols);
    root.style.setProperty('--folder-grid-rows', folderRows);
    root.style.setProperty('--grid-align-y', alignY);

    const alignYRadios = document.querySelectorAll('input[name="align-y"]');
    if (alignYRadios.length) {
      alignYRadios.forEach(r => r.checked = r.value === alignY);
    }

    const brightnessVal = 1 - (bgDarkness / 100);
    root.style.setProperty('--bg-brightness', brightnessVal);
    root.style.setProperty('--bg-blur', `${bgBlur}px`);

    iconSizeSlider.value = iconSize; iconSizeVal.textContent = `${iconSize}px`;
    const iconRadiusSlider = document.getElementById('icon-radius-slider');
    const iconRadiusVal = document.getElementById('icon-radius-val');
    if (iconRadiusSlider && iconRadiusVal) {
      iconRadiusSlider.max = maxRadius;
      iconRadiusSlider.value = iconRadius;
      iconRadiusVal.textContent = `${iconRadius}px`;
    }
    const innerIconScaleSlider = document.getElementById('inner-icon-scale-slider');
    const innerIconScaleVal = document.getElementById('inner-icon-scale-val');
    if (innerIconScaleSlider && innerIconScaleVal) {
      innerIconScaleSlider.value = innerIconScale;
      innerIconScaleVal.textContent = `${innerIconScale}%`;
    }
    colsSlider.value = gridCols; colsVal.textContent = gridCols;
    rowsSlider.value = gridRows; rowsVal.textContent = gridRows;
    gapXSlider.value = gapX; gapXVal.textContent = `${gapX}px`;
    gapYSlider.value = gapY; gapYVal.textContent = `${gapY}px`;

    const folderColsSlider = document.getElementById('folder-cols-slider');
    const folderColsVal = document.getElementById('folder-cols-val');
    if (folderColsSlider && folderColsVal) {
      folderColsSlider.value = folderCols;
      folderColsVal.textContent = folderCols;
    }
    const folderRowsSlider = document.getElementById('folder-rows-slider');
    const folderRowsVal = document.getElementById('folder-rows-val');
    if (folderRowsSlider && folderRowsVal) {
      folderRowsSlider.value = folderRows;
      folderRowsVal.textContent = folderRows;
    }

    bgBrightnessSlider.value = bgDarkness; bgBrightnessVal.textContent = `${bgDarkness}%`;
    bgBlurSlider.value = bgBlur; bgBlurVal.textContent = `${bgBlur}px`;

    // NUOVO: aggiorna controlli UI
    const themeRadios = document.querySelectorAll('input[name="theme-mode"]');
    themeRadios.forEach(r => r.checked = r.value === themeMode);

    const boxModeRadios = document.querySelectorAll('input[name="box-mode"]');
    boxModeRadios.forEach(r => r.checked = r.value === boxMode);

    const boxStyleSettings = document.getElementById('box-style-settings');
    if (boxStyleSettings) {
      boxStyleSettings.style.display = boxMode === 'box' ? 'block' : 'none';
    }

    const boxBgStyleRadios = document.querySelectorAll('input[name="box-bg-style"]');
    boxBgStyleRadios.forEach(r => r.checked = r.value === boxBgStyle);

    const boxColorPicker = document.getElementById('box-color-picker');
    if (boxColorPicker) boxColorPicker.value = boxColor;

    const boxOpacitySlider = document.getElementById('box-opacity-slider');
    const boxOpacityVal = document.getElementById('box-opacity-val');
    if (boxOpacitySlider && boxOpacityVal) {
      boxOpacitySlider.value = boxOpacity;
      boxOpacityVal.textContent = `${boxOpacity}%`;
    }

    const boxBorderWidthSlider = document.getElementById('box-border-width-slider');
    const boxBorderWidthVal = document.getElementById('box-border-width-val');
    if (boxBorderWidthSlider && boxBorderWidthVal) {
      boxBorderWidthSlider.value = boxBorderWidth;
      boxBorderWidthVal.textContent = `${boxBorderWidth}px`;
    }

    const boxBorderColorPicker = document.getElementById('box-border-color-picker');
    if (boxBorderColorPicker) boxBorderColorPicker.value = boxBorderColor;

    const boxBorderOpacitySlider = document.getElementById('box-border-opacity-slider');
    const boxBorderOpacityVal = document.getElementById('box-border-opacity-val');
    if (boxBorderOpacitySlider && boxBorderOpacityVal) {
      boxBorderOpacitySlider.value = boxBorderOpacity;
      boxBorderOpacityVal.textContent = `${boxBorderOpacity}%`;
    }

    const boxShadowBlurSlider = document.getElementById('box-shadow-blur-slider');
    const boxShadowBlurVal = document.getElementById('box-shadow-blur-val');
    if (boxShadowBlurSlider && boxShadowBlurVal) {
      boxShadowBlurSlider.value = boxShadowBlur;
      boxShadowBlurVal.textContent = `${boxShadowBlur}px`;
    }

    const boxShadowOpacitySlider = document.getElementById('box-shadow-opacity-slider');
    const boxShadowOpacityVal = document.getElementById('box-shadow-opacity-val');
    if (boxShadowOpacitySlider && boxShadowOpacityVal) {
      boxShadowOpacitySlider.value = boxShadowOpacity;
      boxShadowOpacityVal.textContent = `${boxShadowOpacity}%`;
    }

    const boxHoverScaleSlider = document.getElementById('box-hover-scale-slider');
    const boxHoverScaleVal = document.getElementById('box-hover-scale-val');
    if (boxHoverScaleSlider && boxHoverScaleVal) {
      boxHoverScaleSlider.value = boxHoverScale;
      boxHoverScaleVal.textContent = boxHoverScale.toString();
    }

    const boxHoverLiftSlider = document.getElementById('box-hover-lift-slider');
    const boxHoverLiftVal = document.getElementById('box-hover-lift-val');
    if (boxHoverLiftSlider && boxHoverLiftVal) {
      boxHoverLiftSlider.value = boxHoverLift;
      boxHoverLiftVal.textContent = `${boxHoverLift}px`;
    }

    const showTitleCheckbox = document.getElementById('show-title-checkbox');
    if (showTitleCheckbox) showTitleCheckbox.checked = showTitle;

    const titleFontSizeSlider = document.getElementById('title-font-size-slider');
    const titleFontSizeVal = document.getElementById('title-font-size-val');
    if (titleFontSizeSlider && titleFontSizeVal) {
      titleFontSizeSlider.value = titleFontSize;
      titleFontSizeVal.textContent = `${titleFontSize}px`;
    }

    // Aggiorna visivamente tutti i track degli slider dopo aver caricato i dati
    document.querySelectorAll('input[type="range"].slider').forEach(updateSliderTrack);

    // Il contrasto dipende da tema, oscuramento dello sfondo, colore e
    // opacità del riquadro: va ricalcolato a ogni applicazione delle
    // impostazioni, non solo al cambio di sfondo.
    updateBackgroundContrast();
  };

  const bindSlider = (slider, key, updateFn, isFloat = false) => {
    if (!slider) return;
    slider.addEventListener('input', (e) => {
      const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);
      updateFn(val);
      applySettings();
      if (['gridCols', 'gridRows', 'folderCols', 'folderRows', 'iconSize', 'gapX', 'gapY', 'titleFontSize'].includes(key)) render();
    });
    slider.addEventListener('change', async (e) => {
      const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);
      await chrome.storage.local.set({ [key]: val });
    });
  };

  bindSlider(iconSizeSlider, 'iconSize', (v) => iconSize = v);
  const iconRadiusSlider = document.getElementById('icon-radius-slider');
  if (iconRadiusSlider) bindSlider(iconRadiusSlider, 'iconRadius', (v) => iconRadius = v);
  const innerIconScaleSlider = document.getElementById('inner-icon-scale-slider');
  if (innerIconScaleSlider) bindSlider(innerIconScaleSlider, 'innerIconScale', (v) => innerIconScale = v);
  bindSlider(colsSlider, 'gridCols', (v) => gridCols = v);
  bindSlider(rowsSlider, 'gridRows', (v) => gridRows = v);
  bindSlider(gapXSlider, 'gapX', (v) => gapX = v);
  bindSlider(gapYSlider, 'gapY', (v) => gapY = v);
  const folderColsSliderElem = document.getElementById('folder-cols-slider');
  if (folderColsSliderElem) bindSlider(folderColsSliderElem, 'folderCols', (v) => folderCols = v);
  const folderRowsSliderElem = document.getElementById('folder-rows-slider');
  if (folderRowsSliderElem) bindSlider(folderRowsSliderElem, 'folderRows', (v) => folderRows = v);
  bindSlider(bgBrightnessSlider, 'bgDarkness', (v) => bgDarkness = v);
  bindSlider(bgBlurSlider, 'bgBlur', (v) => bgBlur = v);

  const alignYRadios = document.querySelectorAll('input[name="align-y"]');
  alignYRadios.forEach(radio => {
    radio.addEventListener('change', async (e) => {
      alignY = e.target.value;
      root.style.setProperty('--grid-align-y', alignY);
      await chrome.storage.local.set({ alignY });
    });
  });

  // NUOVO: bind stile box avanzato
  const boxOpacitySlider = document.getElementById('box-opacity-slider');
  if (boxOpacitySlider) bindSlider(boxOpacitySlider, 'boxOpacity', (v) => boxOpacity = v);

  const boxBorderWidthSlider = document.getElementById('box-border-width-slider');
  if (boxBorderWidthSlider) bindSlider(boxBorderWidthSlider, 'boxBorderWidth', (v) => boxBorderWidth = v);

  const boxBorderOpacitySlider = document.getElementById('box-border-opacity-slider');
  if (boxBorderOpacitySlider) bindSlider(boxBorderOpacitySlider, 'boxBorderOpacity', (v) => boxBorderOpacity = v);

  const boxShadowBlurSlider = document.getElementById('box-shadow-blur-slider');
  if (boxShadowBlurSlider) bindSlider(boxShadowBlurSlider, 'boxShadowBlur', (v) => boxShadowBlur = v);

  const boxShadowOpacitySlider = document.getElementById('box-shadow-opacity-slider');
  if (boxShadowOpacitySlider) bindSlider(boxShadowOpacitySlider, 'boxShadowOpacity', (v) => boxShadowOpacity = v);

  const boxHoverScaleSlider = document.getElementById('box-hover-scale-slider');
  if (boxHoverScaleSlider) bindSlider(boxHoverScaleSlider, 'boxHoverScale', (v) => boxHoverScale = v, true);

  const boxHoverLiftSlider = document.getElementById('box-hover-lift-slider');
  if (boxHoverLiftSlider) bindSlider(boxHoverLiftSlider, 'boxHoverLift', (v) => boxHoverLift = v);

  const titleFontSizeSlider = document.getElementById('title-font-size-slider');
  if (titleFontSizeSlider) bindSlider(titleFontSizeSlider, 'titleFontSize', (v) => titleFontSize = v);

  // NUOVO: event listeners tema e box
  const themeRadios = document.querySelectorAll('input[name="theme-mode"]');
  themeRadios.forEach(r => {
    r.addEventListener('change', async (e) => {
      themeMode = e.target.value;
      applySettings();
      await chrome.storage.local.set({ themeMode });
    });
  });

  const boxModeRadios = document.querySelectorAll('input[name="box-mode"]');
  boxModeRadios.forEach(r => {
    r.addEventListener('change', async (e) => {
      boxMode = e.target.value;
      applySettings();
      await chrome.storage.local.set({ boxMode });
    });
  });

  const boxBgStyleRadios = document.querySelectorAll('input[name="box-bg-style"]');
  boxBgStyleRadios.forEach(r => {
    r.addEventListener('change', async (e) => {
      boxBgStyle = e.target.value;
      applySettings();
      await chrome.storage.local.set({ boxBgStyle });
    });
  });

  const boxColorSwatches = document.querySelectorAll('.box-color-swatch[data-color]');
  boxColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', async () => {
      boxColor = swatch.dataset.color;
      const picker = document.getElementById('box-color-picker');
      if (picker) picker.value = boxColor;
      applySettings();
      await chrome.storage.local.set({ boxColor });
    });
  });

  const boxColorPicker = document.getElementById('box-color-picker');
  if (boxColorPicker) {
    boxColorPicker.addEventListener('change', async (e) => {
      boxColor = e.target.value;
      applySettings();
      await chrome.storage.local.set({ boxColor });
    });
  }

  const boxBorderColorPicker = document.getElementById('box-border-color-picker');
  if (boxBorderColorPicker) {
    boxBorderColorPicker.addEventListener('change', async (e) => {
      boxBorderColor = e.target.value;
      applySettings();
      await chrome.storage.local.set({ boxBorderColor });
    });
  }

  const showTitleCheckbox = document.getElementById('show-title-checkbox');
  if (showTitleCheckbox) {
    showTitleCheckbox.addEventListener('change', async (e) => {
      showTitle = e.target.checked;
      applySettings();
      await chrome.storage.local.set({ showTitle });
    });
  }

  // ===== ADATTAMENTO RESPONSIVE =====
  // Le icone mantengono sempre la dimensione scelta: quando la finestra è
  // più piccola cala il numero di colonne/righe visibili (mai oltre quelle
  // impostate) e i collegamenti che non entrano passano alla pagina dopo.
  // Spazio per le frecce di pagina ai lati (±4rem, ±3rem sotto i 700px)
  const navReserve = () => (window.innerWidth <= 700 ? 104 : 140);
  let effMain = { cols: gridCols, rows: gridRows };
  let effFolder = { cols: folderCols, rows: folderRows };
  const mainPerPage = () => effMain.cols * effMain.rows;
  const folderPerPage = () => effFolder.cols * effFolder.rows;

  const cellSize = () => {
    const sample = document.querySelector('#grid .item-wrapper, #folder-grid .item-wrapper');
    const titleH = showTitle ? Math.ceil(titleFontSize * 1.3) + 8 : 0;
    return {
      w: sample ? sample.offsetWidth : iconSize + 16,
      h: sample ? sample.offsetHeight : iconSize + titleH
    };
  };

  const fitCount = (avail, cell, gap, max) =>
    Math.max(1, Math.min(max, Math.floor((avail + gap) / (cell + gap))));

  const computeLayout = () => {
    const cell = cellSize();

    const mainView = document.getElementById('main-view');
    const cs = getComputedStyle(mainView);
    const mainW = mainView.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - navReserve();
    const mainH = mainView.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const main = { cols: fitCount(mainW, cell.w, gapX, gridCols), rows: fitCount(mainH, cell.h, gapY, gridRows) };

    const content = folderView.querySelector('.folder-view-content');
    const header = folderView.querySelector('.folder-view-header');
    const vs = getComputedStyle(folderView);
    const ccs = getComputedStyle(content);
    const padW = parseFloat(vs.paddingLeft) + parseFloat(vs.paddingRight) + parseFloat(ccs.paddingLeft) + parseFloat(ccs.paddingRight);
    const padH = parseFloat(vs.paddingTop) + parseFloat(vs.paddingBottom) + parseFloat(ccs.paddingTop) + parseFloat(ccs.paddingBottom);
    const headerH = (header.offsetHeight || 40) + (parseFloat(getComputedStyle(header).marginBottom) || 0);
    const folder = {
      cols: fitCount(window.innerWidth - padW - navReserve(), cell.w, gapX, folderCols),
      rows: fitCount(window.innerHeight - padH - headerH, cell.h, gapY, folderRows)
    };

    // Cambiando gli elementi per pagina si resta sulla pagina che contiene
    // il primo collegamento visibile prima del cambio.
    if (main.cols * main.rows !== mainPerPage()) {
      currentMainPage = Math.floor((currentMainPage * mainPerPage()) / (main.cols * main.rows));
    }
    if (folder.cols * folder.rows !== folderPerPage()) {
      currentFolderPage = Math.floor((currentFolderPage * folderPerPage()) / (folder.cols * folder.rows));
    }
    const changed = main.cols !== effMain.cols || main.rows !== effMain.rows ||
      folder.cols !== effFolder.cols || folder.rows !== effFolder.rows;
    effMain = main;
    effFolder = folder;

    mainView.style.setProperty('--grid-cols', effMain.cols);
    folderView.style.setProperty('--folder-grid-cols', effFolder.cols);
    folderView.style.setProperty('--folder-grid-rows', effFolder.rows);
    return changed;
  };

  let fitFrame = null;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => { if (computeLayout()) render(); });
  });

  // 2. Rendering UI
  const createItemHTML = (item) => {
    const name = escapeHtml(item.name);
    const id = escapeHtml(item.id);

    if (item.type === 'link') {
      const initial = escapeHtml(String(item.name || '').charAt(0).toUpperCase());
      const custom = safeIconSrc(item.customIcon);
      const auto = cachedIconSrc(safeIconSrc(item.autoIcon));
      const iconContent = custom
        ? `<img src="${escapeHtml(custom)}" alt="${name}" class="custom-icon-rendered">`
        : (auto ? `<img src="${escapeHtml(auto)}" alt="${name}">` : `<span class="icon-text">${initial}</span>`);

      return `
        <a href="${escapeHtml(safeUrl(item.url))}" class="item-wrapper editable-item" data-id="${id}" data-type="link" title="${name}">
          <div class="icon-squircle">
            ${iconContent}
          </div>
          <span class="item-title">${name}</span>
        </a>
      `;
    } else if (item.type === 'folder') {
      let gridHTML = '';
      const children = item.children || [];
      for (let i = 0; i < 9; i++) {
        if (i < children.length) {
          const child = children[i];
          const faviconUrl = safeIconSrc(child.customIcon) || cachedIconSrc(safeIconSrc(child.autoIcon) || safeIconSrc(getFavicon(child.url)));
          const isCustom = !!safeIconSrc(child.customIcon);
          gridHTML += `<div class="folder-mini-icon">${faviconUrl ? `<img src="${escapeHtml(faviconUrl)}" draggable="false" ${isCustom ? 'class="custom-icon-rendered"' : ''}>` : ''}</div>`;
        } else {
          gridHTML += `<div class="folder-mini-icon"></div>`;
        }
      }

      return `
        <div class="item-wrapper folder-item editable-item" data-id="${id}" data-type="folder" title="${name}">
          <div class="icon-squircle">
            <div class="folder-mini-grid">
              ${gridHTML}
            </div>
          </div>
          <span class="item-title">${name}</span>
        </div>
      `;
    }
  };

  const updateBookmarksFromDOM = (containerEl, originalArray, startIndex = 0) => {
    const newArray = [...originalArray];
    const elements = containerEl.querySelectorAll('.editable-item');
    const reorderedItems = [];
    elements.forEach(el => {
      const id = el.dataset.id;
      const { item } = findItemContext(id);
      if (item) reorderedItems.push(item);
    });
    // Replace only the visible items to prevent data loss for paginated/truncated items
    newArray.splice(startIndex, reorderedItems.length, ...reorderedItems);
    return newArray;
  };

  let mainSortable = null;
  let folderSortable = null;
  let currentHoveredFolder = null;
  let isEditMode = false;
  let currentFolderPage = 0;
  let currentMainPage = 0;

  document.addEventListener('dragstart', (e) => {
    // Always prevent native dragging on editable items because Sortable is using forceFallback (JS-based drag).
    // Allowing native drag causes the browser to sometimes drag the raw <a> link instead of the block.
    if (e.target.closest('.editable-item')) {
      e.preventDefault();
    }
    if (e.target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  });

  const editModeBtn = document.getElementById('edit-mode-btn');
  if (editModeBtn) {
    editModeBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      document.body.classList.toggle('edit-mode-active', isEditMode);
      if (mainSortable) mainSortable.option("disabled", !isEditMode);
      if (folderSortable) folderSortable.option("disabled", !isEditMode);
    });
  }

  const folderPrevBtn = document.getElementById('folder-prev-btn');
  const folderNextBtn = document.getElementById('folder-next-btn');

  const mainPrevBtn = document.getElementById('main-prev-btn');
  const mainNextBtn = document.getElementById('main-next-btn');

  if (mainPrevBtn) {
    mainPrevBtn.addEventListener('click', () => {
      if (currentMainPage > 0) {
        currentMainPage--;
        animateMainChange(-1);
      }
    });
  }
  if (mainNextBtn) {
    mainNextBtn.addEventListener('click', () => {
      currentMainPage++;
      animateMainChange(1);
    });
  }

  const animateMainChange = (dir = 1) => {
    mainGrid.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    mainGrid.style.opacity = '0';
    mainGrid.style.transform = `translateX(${dir * -40}px) scale(0.95)`;
    setTimeout(() => {
      render();
      mainGrid.style.transition = 'none';
      mainGrid.style.transform = `translateX(${dir * 40}px) scale(0.95)`;
      void mainGrid.offsetWidth; // force reflow
      mainGrid.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      mainGrid.style.opacity = '1';
      mainGrid.style.transform = 'translateX(0) scale(1)';
    }, 200);
  };

  if (folderPrevBtn) {
    folderPrevBtn.addEventListener('click', () => {
      if (currentFolderPage > 0) {
        currentFolderPage--;
        animateFolderChange(-1);
      }
    });
  }
  if (folderNextBtn) {
    folderNextBtn.addEventListener('click', () => {
      currentFolderPage++;
      animateFolderChange(1);
    });
  }

  const animateFolderChange = (dir = 1) => {
    folderGrid.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    folderGrid.style.opacity = '0';
    folderGrid.style.transform = `translateX(${dir * -40}px) scale(0.95)`;
    setTimeout(() => {
      render();
      folderGrid.style.transition = 'none';
      folderGrid.style.transform = `translateX(${dir * 40}px) scale(0.95)`;
      void folderGrid.offsetWidth; // force reflow
      folderGrid.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      folderGrid.style.opacity = '1';
      folderGrid.style.transform = 'translateX(0) scale(1)';
    }, 200);
  };

  let isWheelThrottled = false;
  window.addEventListener('wheel', (e) => {
    const addDialogObj = document.getElementById('add-dialog');
    const cropDialogObj = document.getElementById('crop-dialog');
    const iconGalleryDialogObj = document.getElementById('icon-gallery-dialog');
    const settingsSidebarObj = document.getElementById('settings-sidebar');

    if (document.body.classList.contains('is-dragging')) return;
    if (addDialogObj && addDialogObj.hasAttribute('open')) return;
    if (cropDialogObj && cropDialogObj.hasAttribute('open')) return;
    if (iconGalleryDialogObj && iconGalleryDialogObj.hasAttribute('open')) return;
    if (settingsSidebarObj && settingsSidebarObj.classList.contains('open')) return;

    if (isWheelThrottled) return;
    if (Math.abs(e.deltaY) < 30) return; // Ignore tiny scroll events

    const isFolderOpen = currentFolderId !== null;
    const itemsPerPage = isFolderOpen ? folderPerPage() : mainPerPage();
    
    let totalChildren = bookmarks.length;
    if (isFolderOpen) {
       const folder = bookmarks.find(b => b.id === currentFolderId);
       totalChildren = (folder && folder.children) ? folder.children.length : 0;
    }
    
    const totalPages = Math.ceil((totalChildren + 1) / itemsPerPage);
    const currentPage = isFolderOpen ? currentFolderPage : currentMainPage;

    let direction = e.deltaY > 0 ? 1 : -1;

    if (direction === 1 && currentPage < totalPages - 1) {
        isWheelThrottled = true;
        if (isFolderOpen) {
            currentFolderPage++;
            animateFolderChange(1);
        } else {
            currentMainPage++;
            animateMainChange(1);
        }
        setTimeout(() => isWheelThrottled = false, 600);
    } else if (direction === -1 && currentPage > 0) {
        isWheelThrottled = true;
        if (isFolderOpen) {
            currentFolderPage--;
            animateFolderChange(-1);
        } else {
            currentMainPage--;
            animateMainChange(-1);
        }
        setTimeout(() => isWheelThrottled = false, 600);
    }
  }, { passive: true });

  const bindItemEvents = (container, isFolder) => {
    container.querySelectorAll('.folder-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (isEditMode) return;
        e.preventDefault();
        openFolder(el.dataset.id);
      });
    });

    container.querySelectorAll('.editable-item').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openEditDialog(el.dataset.id);
      });
      el.addEventListener('click', (e) => {
        if (isEditMode) e.preventDefault();
      });
    });

    const sortableInst = new Sortable(container, {
      animation: 200,
      disabled: !isEditMode,
      filter: '.add-item-btn',
      draggable: '.editable-item',
      preventOnFilter: false,
      forceFallback: true,
      fallbackClass: 'sortable-drag-fallback',
      ghostClass: 'sortable-ghost',
      onStart: () => {
        document.body.classList.add('is-dragging');
      },
      onMove: (evt) => {
        const draggedType = evt.dragged.dataset.type;
        const relatedType = evt.related.dataset.type;
        
        if (currentHoveredFolder && currentHoveredFolder !== evt.related) {
           currentHoveredFolder.classList.remove('drag-over');
           currentHoveredFolder = null;
        }

        if (draggedType === 'link' && relatedType === 'folder' && !isFolder) {
          evt.related.classList.add('drag-over');
          currentHoveredFolder = evt.related;
          return false;
        }
        
        return true;
      },
      onEnd: async (evt) => {
        document.body.classList.remove('is-dragging');
        
        let dropX, dropY;
        if (evt.originalEvent) {
           if (evt.originalEvent.touches && evt.originalEvent.touches.length > 0) {
               dropX = evt.originalEvent.touches[0].clientX;
               dropY = evt.originalEvent.touches[0].clientY;
           } else if (evt.originalEvent.changedTouches && evt.originalEvent.changedTouches.length > 0) {
               dropX = evt.originalEvent.changedTouches[0].clientX;
               dropY = evt.originalEvent.changedTouches[0].clientY;
           } else {
               dropX = evt.originalEvent.clientX;
               dropY = evt.originalEvent.clientY;
           }
        }

        // Ignore invalid/synthetic coordinates like (0,0) which happen on simple clicks or canceled drags
        const hasValidCoords = dropX !== undefined && dropY !== undefined && !(dropX === 0 && dropY === 0);

        if (currentHoveredFolder) {
           const targetFolderId = currentHoveredFolder.dataset.id;
           const draggedId = evt.item.dataset.id;
           
           let isOverFolder = true;
           if (hasValidCoords) {
               const fRect = currentHoveredFolder.getBoundingClientRect();
               if (dropX < fRect.left || dropX > fRect.right || dropY < fRect.top || dropY > fRect.bottom) {
                   isOverFolder = false; // Mouse left the folder before dropping!
               }
           }
           
           currentHoveredFolder.classList.remove('drag-over');
           currentHoveredFolder = null;
           
           if (isOverFolder) {
               const draggedCtx = findItemContext(draggedId);
               const targetCtx = findItemContext(targetFolderId);
               
               if (draggedCtx.item && targetCtx.item) {
                 const idx = draggedCtx.parentArray.findIndex(x => x.id === draggedId);
                 const [draggedItem] = draggedCtx.parentArray.splice(idx, 1);
                 if (!targetCtx.item.children) targetCtx.item.children = [];
                 targetCtx.item.children.unshift(draggedItem);
                 
                 await saveBookmarks();
                 render();
               }
               return;
           }
        }

        if (isFolder && hasValidCoords) {
           const contentBox = document.querySelector('.folder-view-content');
           if (contentBox) {
              const rect = contentBox.getBoundingClientRect();
              if (dropX < rect.left || dropX > rect.right || dropY < rect.top || dropY > rect.bottom) {
                 const draggedId = evt.item.dataset.id;
                 const draggedCtx = findItemContext(draggedId);
                 if (draggedCtx.item) {
                     const idx = draggedCtx.parentArray.findIndex(x => x.id === draggedId);
                     if (idx !== -1) {
                         const [draggedItem] = draggedCtx.parentArray.splice(idx, 1);
                         bookmarks.push(draggedItem);
                         await saveBookmarks();
                         render();
                         showToast("Spostato nella Home");
                         return;
                     }
                 }
              }
           }
        }

        if (isFolder) {
           const folder = bookmarks.find(b => b.id === currentFolderId);
           const startIndex = currentFolderPage * folderPerPage();
           if (folder) folder.children = updateBookmarksFromDOM(folderGrid, folder.children, startIndex);
        } else {
           const startIndex = currentMainPage * mainPerPage();
           bookmarks = updateBookmarksFromDOM(mainGrid, bookmarks, startIndex);
        }
        await saveBookmarks();
      }
    });

    if (isFolder) folderSortable = sortableInst;
    else mainSortable = sortableInst;
  };

  const render = () => {
      computeLayout();
      if (currentFolderId === null) {
        if (folderSortable) {
          folderSortable.destroy();
          folderSortable = null;
        }
        if (mainSortable) {
          mainSortable.destroy();
          mainSortable = null;
        }

        mainGrid.innerHTML = '';

        if (!folderView.classList.contains('hidden')) {
          folderView.classList.remove('animate-fadeIn');
          folderView.classList.add('animate-fadeOut');
          const content = folderView.querySelector('.folder-view-content');
          content.classList.remove('animate-popIn');
          content.classList.add('animate-popOut');

          setTimeout(() => {
            folderView.classList.add('hidden');
            folderView.classList.remove('animate-fadeOut');
            content.classList.remove('animate-popOut');
          }, 300);
        }

        const itemsPerPage = mainPerPage();
        const maxSlotsPerPage = itemsPerPage - 1; // leave 1 for ADD button
        
        const totalPages = Math.ceil((bookmarks.length + 1) / itemsPerPage);
        if (currentMainPage >= totalPages) currentMainPage = Math.max(0, totalPages - 1);

        const startIndex = currentMainPage * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        const isLastPage = currentMainPage === totalPages - 1;
        
        if (isLastPage) {
           endIndex = startIndex + maxSlotsPerPage;
        }

        const visibleBookmarks = bookmarks.slice(startIndex, endIndex);

        visibleBookmarks.forEach(item => {
          mainGrid.insertAdjacentHTML('beforeend', createItemHTML(item));
        });

        if (isLastPage) {
          const addBtnHTML = `
            <div id="add-btn" class="item-wrapper add-item-btn editable-item" role="button" tabindex="0" aria-label="Aggiungi">
              <div class="icon-squircle add-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span class="item-title">Aggiungi</span>
            </div>
          `;
          mainGrid.insertAdjacentHTML('beforeend', addBtnHTML);

          const addBtn = document.getElementById('add-btn');
          if (addBtn) {
            addBtn.addEventListener('click', (e) => {
              if (!isEditMode) openAddDialog();
            });
          }
        }
        
        if (mainPrevBtn) mainPrevBtn.classList.toggle('hidden', currentMainPage === 0);
        if (mainNextBtn) mainNextBtn.classList.toggle('hidden', currentMainPage >= totalPages - 1);

        bindItemEvents(mainGrid, false);
      } else {
      const folder = bookmarks.find(b => b.id === currentFolderId);
      if (!folder) {
        currentFolderId = null;
        render();
        return;
      }
      
      if (folderSortable) {
        folderSortable.destroy();
        folderSortable = null;
      }

      folderTitle.textContent = folder.name;
      folderGrid.innerHTML = '';

      folderView.classList.remove('hidden');
      folderView.classList.add('animate-fadeIn');
      const content = folderView.querySelector('.folder-view-content');
      content.classList.add('animate-popIn');

      const totalChildren = (folder.children || []).length;
      const itemsPerPage = folderPerPage();
      const maxSlotsPerPage = itemsPerPage - 1; // leave 1 for ADD button

      const totalPages = Math.ceil((totalChildren + 1) / itemsPerPage);
      if (currentFolderPage >= totalPages) currentFolderPage = Math.max(0, totalPages - 1);

      const startIndex = currentFolderPage * itemsPerPage;
      let endIndex = startIndex + itemsPerPage;
      const isLastPage = currentFolderPage === totalPages - 1;
      
      if (isLastPage) {
         endIndex = startIndex + maxSlotsPerPage;
      }

      const visibleChildren = (folder.children || []).slice(startIndex, endIndex);

      visibleChildren.forEach(item => {
        folderGrid.insertAdjacentHTML('beforeend', createItemHTML(item));
      });

      if (isLastPage) {
        folderGrid.insertAdjacentHTML('beforeend', `
          <div class="item-wrapper add-item-btn">
            <div class="icon-squircle add-new-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <span class="item-title">Aggiungi</span>
          </div>
        `);
      }

      bindItemEvents(folderGrid, true);
      const folderAddBtn = document.querySelector('#folder-grid .add-item-btn');
      if (folderAddBtn) {
         folderAddBtn.addEventListener('click', (e) => {
            if (!isEditMode) openAddDialog();
         });
      }

      if (folderPrevBtn) folderPrevBtn.classList.toggle('hidden', currentFolderPage === 0);
      if (folderNextBtn) folderNextBtn.classList.toggle('hidden', currentFolderPage >= totalPages - 1);
    }
  };

  const openFolder = (id) => {
    currentFolderId = id;
    render();
  };

  closeFolderBtn.addEventListener('click', () => {
    currentFolderId = null;
    render();
  });

  folderView.addEventListener('click', (e) => {
    // Chiudi la cartella se non è stato cliccato un collegamento (.item-wrapper) o un pulsante (.icon-btn)
    if (!e.target.closest('.item-wrapper') && !e.target.closest('.icon-btn')) {
      currentFolderId = null;
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentFolderId !== null) {
      currentFolderId = null;
      render();
    }
  });

  // Variabili per i nuovi elementi DOM
  const autoIconImg = document.getElementById('auto-icon-img');
  const autoIconPlaceholder = document.getElementById('auto-icon-placeholder');
  const iconChoiceAuto = document.getElementById('icon-choice-auto');
  const iconChoiceCustom = document.getElementById('icon-choice-custom');
  const customIconTrigger = document.getElementById('custom-icon-trigger');

  let currentAutoIcons = [];
  let currentAutoIconIndex = 0;
  const autoGalleryBtn = document.getElementById('auto-gallery-btn');
  const autoCropBtn = document.getElementById('auto-crop-btn');
  const customCropBtn = document.getElementById('custom-crop-btn');
  const iconGalleryDialog = document.getElementById('icon-gallery-dialog');
  const iconGalleryGrid = document.getElementById('icon-gallery-grid');
  const closeGalleryBtn = document.getElementById('close-gallery-btn');

  let currentAutoIconsData = [];
  let updateIconTimeout = null;

  const loadAndSortIcons = async (urls) => {
    const promises = urls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight, valid: true });
        img.onerror = () => resolve({ url, valid: false, width: 0, height: 0 });
        img.src = url;
      });
    });
    const results = await Promise.all(promises);
    const validIcons = results.filter(r => r.valid && r.width > 0);
    validIcons.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    return validIcons;
  };

  const updateIconPreviewState = () => {
    if (currentCustomIcon) {
      customIconImg.src = currentCustomIcon;
      customIconImg.classList.remove('hidden');
      uploadPlaceholder.classList.add('hidden');
      removeCustomIconBtn.classList.remove('hidden');
      if (customCropBtn) customCropBtn.classList.remove('hidden');
      iconChoiceCustom.checked = true;
    } else {
      customIconImg.src = '';
      customIconImg.classList.add('hidden');
      uploadPlaceholder.classList.remove('hidden');
      removeCustomIconBtn.classList.add('hidden');
      if (customCropBtn) customCropBtn.classList.add('hidden');
      iconChoiceAuto.checked = true;
    }

    if (updateIconTimeout) clearTimeout(updateIconTimeout);
    updateIconTimeout = setTimeout(async () => {
      const urls = getFaviconPool(itemUrlInput.value);
      if (urls.length === 0 || !typeRadios[0].checked) {
        currentAutoIcons = [];
        currentAutoIconsData = [];
        autoIconImg.src = '';
        autoIconImg.classList.add('hidden');
        autoIconPlaceholder.classList.remove('hidden');
        if (autoGalleryBtn) autoGalleryBtn.classList.add('hidden');
        if (autoCropBtn) autoCropBtn.classList.add('hidden');
        return;
      }

      const sortedIcons = await loadAndSortIcons(urls);
      if (sortedIcons.length === 0 && editingItemId) {
        const { item } = findItemContext(editingItemId);
        if (item && item.autoIcon && iconCache[item.autoIcon]) {
          sortedIcons.push({ url: item.autoIcon, width: 1, height: 1, valid: true });
        }
      }
      currentAutoIcons = sortedIcons.map(i => i.url);
      currentAutoIconsData = sortedIcons;

      if (editingItemId) {
        const { item } = findItemContext(editingItemId);
        if (item && item.autoIcon) {
          const foundIdx = currentAutoIcons.indexOf(item.autoIcon);
          if (foundIdx !== -1) currentAutoIconIndex = foundIdx;
        }
      }

      if (currentAutoIcons.length > 0) {
        if (currentAutoIconIndex >= currentAutoIcons.length) currentAutoIconIndex = 0;

        autoIconImg.src = cachedIconSrc(currentAutoIcons[currentAutoIconIndex]);
        autoIconImg.classList.remove('hidden');
        autoIconPlaceholder.classList.add('hidden');

        if (currentAutoIcons.length > 1) {
          if (autoGalleryBtn) autoGalleryBtn.classList.remove('hidden');
        } else {
          if (autoGalleryBtn) autoGalleryBtn.classList.add('hidden');
        }
        if (autoCropBtn) autoCropBtn.classList.remove('hidden');
      } else {
        autoIconImg.src = '';
        autoIconImg.classList.add('hidden');
        autoIconPlaceholder.classList.remove('hidden');
        if (autoGalleryBtn) autoGalleryBtn.classList.add('hidden');
        if (autoCropBtn) autoCropBtn.classList.add('hidden');
      }
    }, 300);
  };

  itemUrlInput.addEventListener('input', () => {
    currentAutoIconIndex = 0;
    updateIconPreviewState();
  });

  if (autoCropBtn) {
    autoCropBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentAutoUrl = currentAutoIcons[currentAutoIconIndex];
      if (currentAutoUrl) {
        try {
          const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'fetchImage', url: currentAutoUrl }, resolve);
          });
          if (response.error) throw new Error(response.error);
          cropImgObj.src = response.dataUrl;
        } catch (err) {
          showToast("Errore durante il caricamento dell'icona per il ritaglio.");
        }
      }
    });
  }

  if (autoGalleryBtn) {
    autoGalleryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentAutoIconsData && currentAutoIconsData.length > 0) {
        iconGalleryGrid.innerHTML = '';
        currentAutoIconsData.forEach((iconData, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `p-3 flex flex-col items-center justify-between transition-all shadow-sm`;
          btn.style.height = '140px';
          btn.style.backgroundColor = '#f8fafc';
          btn.style.borderRadius = '8px';
          if (index === currentAutoIconIndex) {
            btn.style.border = '2px solid #3b82f6';
          } else {
            btn.style.border = '1px solid #94a3b8';
          }

          const img = document.createElement('img');
          img.src = iconData.url;
          img.alt = 'Icon Option';
          img.className = 'w-full mb-3 mt-1';
          img.style.height = '76px';
          img.style.objectFit = 'contain';

          const sizeText = document.createElement('span');
          sizeText.className = 'text-[11px] font-medium leading-none';
          sizeText.style.padding = '5px 8px';
          sizeText.style.borderRadius = '12px';
          sizeText.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
          sizeText.style.color = '#ffffff';
          sizeText.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          sizeText.textContent = `${iconData.width}x${iconData.height}`;

          btn.appendChild(img);
          btn.appendChild(sizeText);

          btn.addEventListener('click', () => {
            currentAutoIconIndex = index;
            autoIconImg.src = currentAutoIcons[currentAutoIconIndex];
            closeDialogAnimated(iconGalleryDialog);
          });

          iconGalleryGrid.appendChild(btn);
        });
        iconGalleryDialog.showModal();
      }
    });
  }

  if (closeGalleryBtn) {
    closeGalleryBtn.addEventListener('click', () => {
      closeDialogAnimated(iconGalleryDialog);
    });
  }

  if (iconGalleryDialog) {
    iconGalleryDialog.addEventListener('mousedown', (e) => {
      if (e.target === iconGalleryDialog) closeDialogAnimated(iconGalleryDialog);
    });
  }

  const nameLoadingSpinner = document.getElementById('name-loading-spinner');

  itemUrlInput.addEventListener('blur', () => {
    if (itemNameInput.value.trim() === '') {
      let urlStr = itemUrlInput.value.trim();
      if (urlStr) {
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          urlStr = 'https://' + urlStr;
        }
        try {
          const urlObj = new URL(urlStr);
          let hostname = urlObj.hostname;
          if (hostname.startsWith('www.')) hostname = hostname.substring(4);
          const parts = hostname.split('.');
          if (parts.length > 1) parts.pop();
          let domainName = parts.join(' ');
          if (domainName) {
            domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);

            if (nameLoadingSpinner) nameLoadingSpinner.classList.remove('hidden');
            setTimeout(() => {
              itemNameInput.value = domainName;
              updateLivePreview();
              if (nameLoadingSpinner) nameLoadingSpinner.classList.add('hidden');
            }, 500);
          }
        } catch (e) { }
      }
    }
  });
  typeRadios.forEach(r => r.addEventListener('change', updateIconPreviewState));

  // Anteprima dal vivo nel modale: lo stesso riquadro della griglia, così
  // si vede subito l'effetto di nome, tipo e icona scelti.
  const liveIcon = document.getElementById('edit-live-icon');
  const liveName = document.getElementById('edit-live-name');
  const updateLivePreview = () => {
    const isFolder = typeRadios[1].checked;
    const name = itemNameInput.value.trim();
    liveName.textContent = name || (isFolder ? 'Cartella' : 'Nome');
    liveIcon.className = 'edit-live-icon icon-squircle';
    liveIcon.style.borderRadius = `${(iconRadius * 56) / iconSize}px`;

    if (isFolder) {
      // In modifica si riusa la miniatura già disegnata nella griglia.
      const existing = editingItemId && document.querySelector(`.folder-item[data-id="${CSS.escape(editingItemId)}"] .icon-squircle`);
      liveIcon.innerHTML = existing
        ? existing.innerHTML
        : '<div class="folder-mini-grid">' + '<div class="folder-mini-icon"></div>'.repeat(9) + '</div>';
      return;
    }
    const custom = iconChoiceCustom.checked && currentCustomIcon;
    const auto = !autoIconImg.classList.contains('hidden') && autoIconImg.getAttribute('src');
    if (custom) {
      liveIcon.innerHTML = `<img src="${escapeHtml(currentCustomIcon)}" alt="" class="custom-icon-rendered">`;
    } else if (iconChoiceAuto.checked && auto) {
      liveIcon.innerHTML = `<img src="${escapeHtml(auto)}" alt="">`;
    } else {
      liveIcon.innerHTML = `<span class="icon-text" style="font-size: 22px;">${escapeHtml((name || '?').charAt(0).toUpperCase())}</span>`;
    }
  };
  itemNameInput.addEventListener('input', updateLivePreview);
  [iconChoiceAuto, iconChoiceCustom, ...typeRadios].forEach(r => r.addEventListener('change', updateLivePreview));
  autoIconImg.addEventListener('load', updateLivePreview);
  customIconImg.addEventListener('load', updateLivePreview);
  new MutationObserver(updateLivePreview).observe(autoIconImg, { attributes: true, attributeFilter: ['src', 'class'] });
  new MutationObserver(updateLivePreview).observe(customIconImg, { attributes: true, attributeFilter: ['src', 'class'] });

  // Modale - Cropper
  const cropDialog = document.getElementById('crop-dialog');
  const cropperContainer = document.querySelector('.cropper-container');
  const cropCanvas = document.getElementById('crop-canvas');
  const cropCtx = cropCanvas.getContext('2d');
  const cropZoomSlider = document.getElementById('crop-zoom-slider');
  const cropZoomVal = document.getElementById('crop-zoom-val');
  const cropTransparentBg = document.getElementById('crop-transparent-bg');
  const cropBgColor = document.getElementById('crop-bg-color');
  const cropCancelBtn = document.getElementById('crop-cancel-btn');
  const cropConfirmBtn = document.getElementById('crop-confirm-btn');

  let cropImgObj = new Image();
  let cropPanX = 0, cropPanY = 0, cropScale = 1;
  let isDraggingCrop = false, dragStartX = 0, dragStartY = 0, startPanX = 0, startPanY = 0;

  const drawCropper = () => {
    cropCtx.clearRect(0, 0, 400, 400);
    if (!cropTransparentBg.checked) {
      cropCtx.fillStyle = cropBgColor.value;
      cropCtx.fillRect(0, 0, 400, 400);
    }
    cropCtx.save();
    cropCtx.translate(200 + cropPanX, 200 + cropPanY);
    cropCtx.scale(cropScale, cropScale);
    cropCtx.drawImage(cropImgObj, -cropImgObj.width / 2, -cropImgObj.height / 2);
    cropCtx.restore();

    if (isDraggingCrop) {
      cropCtx.save();
      const isSnapped = (cropPanX === 0 && cropPanY === 0);
      cropCtx.strokeStyle = isSnapped ? 'rgba(34, 197, 94, 0.8)' : 'rgba(255, 255, 255, 0.5)';
      cropCtx.lineWidth = isSnapped ? 2 : 1;
      cropCtx.setLineDash(isSnapped ? [] : [5, 5]);
      
      cropCtx.beginPath();
      cropCtx.moveTo(200, 0);
      cropCtx.lineTo(200, 400);
      cropCtx.stroke();
      
      cropCtx.beginPath();
      cropCtx.moveTo(0, 200);
      cropCtx.lineTo(400, 200);
      cropCtx.stroke();
      
      if (isSnapped) {
        cropCtx.beginPath();
        cropCtx.arc(200, 200, 4, 0, Math.PI * 2);
        cropCtx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        cropCtx.fill();
      }
      cropCtx.restore();
    }
  };

  customIconTrigger.addEventListener('click', () => {
    itemCustomIconInput.click();
    iconChoiceCustom.checked = true;
  });

  if (customCropBtn) {
    customCropBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentCustomIcon) {
        cropImgObj.src = currentCustomIcon;
      }
    });
  }

  removeCustomIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCustomIcon = null;
    updateIconPreviewState();
  });

  document.getElementsByName('icon-choice').forEach(r => {
    r.addEventListener('change', (e) => {
      if (e.target.value === 'custom' && !currentCustomIcon) {
        itemCustomIconInput.click();
      }
    });
  });

  itemCustomIconInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        cropImgObj.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  cropImgObj.onload = () => {
    const scale = Math.max(400 / cropImgObj.width, 400 / cropImgObj.height);
    cropScale = scale;
    cropZoomSlider.value = Math.round(scale * 100);
    cropZoomVal.textContent = cropZoomSlider.value + '%';
    updateSliderTrack(cropZoomSlider);
    cropPanX = 0; cropPanY = 0;

    drawCropper();
    cropDialog.showModal();
  };

  cropperContainer.addEventListener('mousedown', (e) => {
    isDraggingCrop = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    startPanX = cropPanX; startPanY = cropPanY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingCrop) return;
    let newPanX = startPanX + (e.clientX - dragStartX);
    let newPanY = startPanY + (e.clientY - dragStartY);
    
    // Snap to center
    if (Math.abs(newPanX) < 15) newPanX = 0;
    if (Math.abs(newPanY) < 15) newPanY = 0;
    
    cropPanX = newPanX;
    cropPanY = newPanY;
    drawCropper();
  });
  window.addEventListener('mouseup', () => {
    if (isDraggingCrop) {
      isDraggingCrop = false;
      drawCropper();
    }
  });

  cropZoomSlider.addEventListener('input', (e) => {
    cropScale = e.target.value / 100;
    cropZoomVal.textContent = e.target.value + '%';
    updateSliderTrack(e.target);
    drawCropper();
  });

  cropTransparentBg.addEventListener('change', (e) => {
    cropBgColor.disabled = e.target.checked;
    drawCropper();
  });
  cropBgColor.addEventListener('input', drawCropper);

  const chiudiCropDialog = () => closeDialogAnimated(cropDialog);

  cropCancelBtn.addEventListener('click', chiudiCropDialog);

  cropConfirmBtn.addEventListener('click', () => {
    currentCustomIcon = cropCanvas.toDataURL('image/png');
    updateIconPreviewState();
    chiudiCropDialog();
    itemCustomIconInput.value = '';
  });

  removeCustomIconBtn.addEventListener('click', () => {
    currentCustomIcon = null;
    itemCustomIconInput.value = '';
    updateIconPreviewState();
  });

  // 3. Logica Aggiunta / Modifica Elementi
  const resetDialogForAdd = () => {
    editingItemId = null;
    currentCustomIcon = null;
    itemCustomIconInput.value = '';
    updateIconPreviewState();

    addForm.reset();
    typeToggleContainer.style.display = 'flex';
    document.getElementById('icon-selection-group').style.display = '';
    deleteItemBtn.classList.add('hidden');

    if (currentFolderId !== null) {
      addFolderLabel.style.display = 'none';
      typeRadios[0].checked = true;
      urlGroup.style.display = 'block';
      itemUrlInput.required = true;
      dialogTitle.textContent = "Aggiungi Collegamento";
    } else {
      addFolderLabel.style.display = 'flex';
      typeRadios[0].checked = true;
      urlGroup.style.display = 'block';
      itemUrlInput.required = true;
      dialogTitle.textContent = "Aggiungi Elemento";
    }
  };

  const openAddDialog = () => {
    resetDialogForAdd();
    updateLivePreview();
    addDialog.showModal();
  };

  const openEditDialog = (id) => {
    const { item } = findItemContext(id);
    if (!item) return;

    editingItemId = id;
    typeToggleContainer.style.display = 'none';
    deleteItemBtn.classList.remove('hidden');

    dialogTitle.textContent = "Modifica Elemento";
    itemNameInput.value = item.name;

    const iconSelectionGroup = document.getElementById('icon-selection-group');

    if (item.type === 'link') {
      typeRadios[0].checked = true;
      urlGroup.style.display = 'block';
      if (iconSelectionGroup) iconSelectionGroup.style.display = 'block';
      itemUrlInput.value = item.url || '';
      itemUrlInput.required = true;
      currentCustomIcon = item.customIcon || null;
      itemCustomIconInput.value = '';

      currentAutoIcons = getFaviconPool(item.url || '');
      currentAutoIconIndex = 0;
      if (item.autoIcon && currentAutoIcons.includes(item.autoIcon)) {
        currentAutoIconIndex = currentAutoIcons.indexOf(item.autoIcon);
      }

      updateIconPreviewState();
    } else {
      typeRadios[1].checked = true;
      urlGroup.style.display = 'none';
      if (iconSelectionGroup) iconSelectionGroup.style.display = 'none';
      itemUrlInput.value = '';
      itemUrlInput.required = false;
      currentCustomIcon = null;
    }

    updateLivePreview();
    addDialog.showModal();
    itemNameInput.focus();
    itemNameInput.select();
    itemUrlInput.scrollLeft = 0;
  };

  const chiudiAddDialog = (e) => {
    if (e && e.target === addDialog) {
      closeDialogAnimated(addDialog);
    }
  };
  addDialog.addEventListener('mousedown', chiudiAddDialog);
  cancelAddBtn.addEventListener('click', () => closeDialogAnimated(addDialog));

  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const iconSelectionGroup = document.getElementById('icon-selection-group');
      if (e.target.value === 'folder') {
        urlGroup.style.display = 'none';
        if (iconSelectionGroup) iconSelectionGroup.style.display = 'none';
        itemUrlInput.required = false;
        itemUrlInput.value = '';
      } else {
        urlGroup.style.display = 'block';
        if (iconSelectionGroup) iconSelectionGroup.style.display = 'block';
        itemUrlInput.required = true;
      }
    });
  });

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    let url = itemUrlInput.value.trim();
    const type = Array.from(typeRadios).find(r => r.checked).value;

    if (type === 'link') {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
    }

    if (editingItemId) {
      const { item } = findItemContext(editingItemId);
      if (item) {
        item.name = name;
        if (type === 'link') {
          item.url = url;
          item.customIcon = document.getElementById('icon-choice-custom').checked ? currentCustomIcon : null;
          item.autoIcon = document.getElementById('icon-choice-auto').checked && currentAutoIcons.length > 0 ? currentAutoIcons[currentAutoIconIndex] : null;
        }
      }
    } else {
      const newItem = {
        id: generateId(),
        type,
        name,
        ...(type === 'link' ? {
          url,
          customIcon: document.getElementById('icon-choice-custom').checked ? currentCustomIcon : null,
          autoIcon: document.getElementById('icon-choice-auto').checked && currentAutoIcons.length > 0 ? currentAutoIcons[currentAutoIconIndex] : null
        } : { children: [] })
      };

      if (currentFolderId === null) {
        bookmarks.push(newItem);
      } else {
        const folder = bookmarks.find(b => b.id === currentFolderId);
        if (folder && folder.type === 'folder') {
          if (!folder.children) folder.children = [];
          folder.children.push(newItem);
        }
      }
    }

    await saveBookmarks();
    closeDialogAnimated(addDialog);
    render();
  });

  // Eliminazione Elemento
  deleteItemBtn.addEventListener('click', async () => {
    if (!editingItemId) return;

    const { item, parentArray } = findItemContext(editingItemId);
    if (item && parentArray) {
      const idx = parentArray.findIndex(x => x.id === editingItemId);
      if (idx !== -1) {
        const nome = item.name || 'Elemento';
        const figli = item.type === 'folder' ? (item.children || []).length : 0;
        const messaggio = figli > 0
          ? `Cartella "${nome}" eliminata (${figli} ${figli === 1 ? 'collegamento' : 'collegamenti'}).`
          : `"${nome}" eliminato.`;

        closeDialogAnimated(addDialog);
        await runUndoable(messaggio, () => { parentArray.splice(idx, 1); });
      }
    }
  });

  // 4. Sidebar Impostazioni
  const openSidebar = () => {
    sidebarBackdrop.classList.add('show');
    settingsSidebar.classList.add('open');
  };

  const closeSidebar = () => {
    sidebarBackdrop.classList.remove('show');
    settingsSidebar.classList.remove('open');
    setTimeout(() => {
      const pageMain = document.getElementById('page-main');
      if (pageMain) pageMain.classList.remove('slide-out');
      document.querySelectorAll('.sidebar-page.sub-page').forEach(page => page.classList.remove('active-sub'));
    }, 350);
  };

  settingsBtn.addEventListener('click', openSidebar);
  closeSettingsBtn.addEventListener('click', closeSidebar);
  sidebarBackdrop.addEventListener('click', closeSidebar);

  // Sidebar Hierarchical Navigation
  const categoryBtns = document.querySelectorAll('.settings-category-btn');
  const backBtns = document.querySelectorAll('.back-btn');
  const pageMain = document.getElementById('page-main');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetPage = document.getElementById(targetId);
      if (targetPage && pageMain) {
        pageMain.classList.add('slide-out');
        targetPage.classList.add('active-sub');
      }
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentSubPage = btn.closest('.sub-page');
      if (currentSubPage && pageMain) {
        currentSubPage.classList.remove('active-sub');
        pageMain.classList.remove('slide-out');
      }
    });
  });

  // Sfondo Upload
  uploadBgBtn.addEventListener('click', () => bgUploadInput.click());
  bgUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        try {
          await chrome.storage.local.set({ background: dataUrl });
          applyBackgroundImage(dataUrl);
        } catch (err) {
          alert("Impossibile salvare l'immagine. Potrebbe superare i limiti.");
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Colore Sfondo
  const setAndSaveColor = async (color) => {
    applyBackgroundColor(color);
    bgColorPicker.value = color;
    await chrome.storage.local.set({ bgColor: color });
    await chrome.storage.local.remove('background');
  };

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      setAndSaveColor(swatch.dataset.color);
    });
  });

  bgColorPicker.addEventListener('input', (e) => {
    applyBackgroundColor(e.target.value);
  });
  bgColorPicker.addEventListener('change', (e) => {
    setAndSaveColor(e.target.value);
  });

  // Chiavi di servizio del file di backup, non impostazioni: non vanno scritte
  // nello storage al momento del ripristino.
  const BACKUP_META_KEYS = ['__backupVersion', '__exportedAt'];

  /**
   * Fotografia completa dello stato: tutto ciò che sta nello storage, più i
   * valori predefiniti delle impostazioni mai modificate. Il risultato descrive
   * lo stato per intero, così il ripristino non dipende da cosa c'è già sul
   * dispositivo di destinazione.
   */
  const buildBackupPayload = async () => {
    const stored = await chrome.storage.local.get(null);
    const payload = { ...SETTING_DEFAULTS, ...stored };
    payload.bookmarks = Array.isArray(stored.bookmarks) ? stored.bookmarks : [];
    delete payload.iconCache; // ricostruibile, non serve nel backup
    payload.migrated = true;
    payload.__backupVersion = 2;
    payload.__exportedAt = new Date().toISOString();
    return payload;
  };

  // Export JSON
  exportBtn.addEventListener('click', async () => {
    let url;
    try {
      const payload = await buildBackupPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newtab-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      const count = payload.bookmarks.length;
      const hasImage = typeof payload.background === 'string' && payload.background.length > 0;
      showToast(`Backup esportato: ${count} collegamenti${hasImage ? ', sfondo incluso' : ''}.`);
    } catch (err) {
      console.error('Esportazione fallita:', err);
      showToast("Esportazione fallita. Riprova.");
    } finally {
      // Revoca ritardata: revocare subito può annullare il download appena avviato.
      if (url) setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  });

  // Utilities aggiuntive
  const toastEl = document.getElementById('toast');
  let toastTimeout;
  const hideToast = () => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.classList.add('hidden'), 300);
  };

  // Il messaggio può portare un'azione (es. "Annulla"). Il testo viene
  // inserito con textContent, mai come HTML: i nomi dei collegamenti
  // finiscono nei messaggi e possono contenere qualsiasi carattere.
  const showToast = (message, options = {}) => {
    const { actionLabel, onAction, duration = 3000 } = options || {};

    toastEl.textContent = '';
    const testo = document.createElement('span');
    testo.className = 'toast-message';
    testo.textContent = message;
    toastEl.appendChild(testo);

    if (actionLabel && typeof onAction === 'function') {
      const azione = document.createElement('button');
      azione.type = 'button';
      azione.className = 'toast-action';
      azione.textContent = actionLabel;
      azione.addEventListener('click', () => {
        clearTimeout(toastTimeout);
        hideToast();
        onAction();
      });
      toastEl.appendChild(azione);
    }

    toastEl.classList.remove('hidden');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, duration);
  };

  // Finestra entro cui l'annullamento resta disponibile.
  const UNDO_WINDOW_MS = 7000;

  // Esegue un'azione distruttiva conservando una copia dei collegamenti,
  // così il toast può offrire il ripristino. La copia è profonda perché la
  // modifica avviene sugli array annidati delle cartelle.
  const runUndoable = async (message, mutate) => {
    const snapshot = JSON.parse(JSON.stringify(bookmarks));
    const folderIdPrima = currentFolderId;

    mutate();
    await saveBookmarks();
    render();

    showToast(message, {
      actionLabel: 'Annulla',
      duration: UNDO_WINDOW_MS,
      onAction: async () => {
        bookmarks = snapshot;
        // Se la cartella aperta al momento dell'eliminazione esiste ancora,
        // ci si torna dentro; altrimenti si resta dove si è.
        if (folderIdPrima && bookmarks.some(b => b.id === folderIdPrima)) {
          currentFolderId = folderIdPrima;
        }
        await saveBookmarks();
        render();
        showToast('Ripristinato.');
      }
    });
  };

  // Import JSON
  importBtn.addEventListener('click', () => importJsonInput.click());
  importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);

          if (Array.isArray(parsed)) {
            // Vecchio formato: solo array di collegamenti, nessuna impostazione.
            bookmarks = parsed;
            await saveBookmarks();
            render();
            showToast("Backup (legacy) ripristinato: solo i collegamenti.");
            closeSidebar();
            return;
          }

          if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.bookmarks)) {
            throw new Error("Formato non valido: manca l'elenco dei collegamenti.");
          }

          // Le impostazioni assenti dal backup tornano al valore predefinito
          // invece di ereditare quelle del dispositivo corrente.
          const restored = { ...SETTING_DEFAULTS, ...parsed, migrated: true };
          BACKUP_META_KEYS.forEach(k => delete restored[k]);

          // Sostituzione integrale: senza clear() le chiavi non presenti nel
          // backup sopravvivrebbero e lo stato non sarebbe identico all'origine.
          // Si conserva una copia per poter tornare indietro se la scrittura fallisce.
          const snapshot = await chrome.storage.local.get(null);
          try {
            await chrome.storage.local.clear();
            await chrome.storage.local.set(restored);
          } catch (writeErr) {
            await chrome.storage.local.clear().catch(() => {});
            await chrome.storage.local.set(snapshot).catch(() => {});
            throw writeErr;
          }

          const count = restored.bookmarks.length;
          const hasImage = typeof restored.background === 'string' && restored.background.length > 0;
          showToast(`Ripristinati ${count} collegamenti${hasImage ? ' e lo sfondo' : ''}. Ricaricamento...`);
          setTimeout(() => location.reload(), 1500);
        } catch (err) {
          console.error('Importazione fallita:', err);
          const msg = String(err && err.message || err);
          showToast(
            /quota|QUOTA/i.test(msg)
              ? "Spazio insufficiente: il backup è troppo grande."
              : "Backup non valido o danneggiato. Nessuna modifica applicata."
          );
        }
      };
      reader.onerror = () => {
        console.error('Lettura del file fallita:', reader.error);
        showToast("Impossibile leggere il file selezionato.");
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  });
  document.querySelectorAll('input[type="range"].slider').forEach(slider => {
    updateSliderTrack(slider);
    slider.addEventListener('input', () => updateSliderTrack(slider));
  });


  // Avvio
  init();
});