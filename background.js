chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetchImage') {
    // Solo i servizi di favicon dichiarati in host_permissions.
    let host = '';
    try { host = new URL(message.url).hostname; } catch (e) { /* URL non valido */ }
    const allowed = ['www.google.com', 'logo.clearbit.com', 'icon.horse', 'api.faviconkit.com', 'icons.duckduckgo.com'];
    if (!allowed.includes(host) && !host.endsWith('.gstatic.com')) {
      sendResponse({ error: 'host non consentito' });
      return false;
    }
    fetch(message.url)
      .then(res => {
        const contentType = res.headers.get('content-type') || 'image/png';
        return res.arrayBuffer().then(buffer => ({ buffer, contentType }));
      })
      .then(({ buffer, contentType }) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        // Process in chunks to avoid call stack size exceeded on large images
        for (let i = 0; i < len; i += 8192) {
          const chunk = bytes.subarray(i, i + 8192);
          binary += String.fromCharCode.apply(null, chunk);
        }
        let base64 = btoa(binary);
        sendResponse({ dataUrl: `data:${contentType};base64,${base64}` });
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});
