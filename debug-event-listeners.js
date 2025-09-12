// debug-event-listeners.js
(function() {
  const registry = [];
  const origAdd = EventTarget.prototype.addEventListener;
  const origRemove = EventTarget.prototype.removeEventListener;
  let autoLogActive = false;

  // Sovrascrive subito add/remove per registrare tutti i listener
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    const exists = registry.some(r =>
      r.target === this &&
      r.type === type &&
      r.listener === listener &&
      JSON.stringify(r.options || {}) === JSON.stringify(options || {})
    );
    if (!exists) {
      registry.push({ target: this, type, listener, options });
    }
    if (autoLogActive) {
      console.log("Listener added:", type, listener.name || "(anonymous)", this);
    }
    return origAdd.call(this, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    for (let i = 0; i < registry.length; i++) {
      const r = registry[i];
      if (r.target === this && r.type === type && r.listener === listener) {
        registry.splice(i, 1);
        if (autoLogActive) {
          console.log("Listener removed:", type, listener.name || "(anonymous)", this);
        }
        break;
      }
    }
    return origRemove.call(this, type, listener, options);
  };

  // Utility globali
  window.showListeners = function(filterType) {
    const data = registry.map(r => ({
      target: r.target.tagName || r.target.constructor.name,
      type: r.type,
      listener: r.listener.name || "(anonymous)",
      options: r.options
    }));
    if (filterType) {
      console.table(data.filter(d => d.type === filterType));
    } else {
      console.table(data);
    }
  };

  window.getListeners = function(element) {
    return registry
      .filter(r => r.target === element)
      .map(r => ({
        type: r.type,
        listener: r.listener.name || "(anonymous)",
        options: r.options
      }));
  };

  // Attiva il log automatico dopo X millisecondi
  const DELAY = 3000; // 3 secondi
  setTimeout(() => {
    autoLogActive = true;
    console.log("Automatic listener logging is now ACTIVE");
  }, DELAY);

})();