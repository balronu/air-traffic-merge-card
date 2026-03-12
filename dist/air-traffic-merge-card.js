class AirTrafficMergeCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error('entity fehlt');
    }
    this.config = {
      title: 'Flugzeuge',
      show_status: true,
      show_debug: false,
      ...config,
    };
  }

  getCardSize() {
    return 6;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass || !this.config) return;

    const stateObj = this._hass.states[this.config.entity];
    if (!stateObj) {
      this.innerHTML = `<ha-card><div class="card-content">Entität ${this.config.entity} nicht gefunden.</div></ha-card>`;
      return;
    }

    const attrs = stateObj.attributes || {};
    const flights = Array.isArray(attrs.flights) ? attrs.flights : [];
    const counts = attrs.counts || {};
    const debug = attrs.debug || {};

    const statusText = {
      both: '✅ Beide Quellen liefern Daten',
      fr24_only: '⚠️ Nur FR24 liefert Daten',
      adsb_only: '⚠️ Nur ADS-B liefert Daten',
      empty: '❌ Keine Flugdaten verfügbar',
      ok: '✅ Daten verfügbar',
    }[attrs.status] || attrs.status || '—';

    const fmt = (v, suffix = '') => (v === null || v === undefined || v === '' ? '—' : `${v}${suffix}`);
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    const chips = `
      <div class="chips">
        <span class="chip">FR24: ${fmt(attrs.fr24_count)}</span>
        <span class="chip">ADS-B: ${fmt(attrs.adsb_count)}</span>
        <span class="chip">Merge: ${fmt(attrs.merged_count)}</span>
        <span class="chip">Medical: ${fmt(counts.medical)}</span>
        <span class="chip">Militär: ${fmt(counts.military)}</span>
        <span class="chip">Heli: ${fmt(counts.helicopter)}</span>
      </div>`;

    const rows = flights.map((f) => `
      <div class="flight ${f.tracked ? 'tracked' : ''}">
        <div class="head">
          <div class="title">${esc(f.icon || '✈️')} ${esc(f.name || 'Unbekannt')}</div>
          ${f.tracked ? '<span class="track-badge">TRACKED</span>' : ''}
        </div>
        <div class="sub">${esc([f.airline, f.type_name].filter(Boolean).join(' ')) || '&nbsp;'}</div>
        <div class="grid">
          <div><b>Kennung:</b> ${esc(f.registration || 'unbekannt')}</div>
          <div><b>Typcode:</b> ${esc(f.typecode || '—')}</div>
          <div><b>Kategorie:</b> ${esc(f.category || '—')}</div>
          <div><b>Quelle:</b> ${esc(f.source_text || f.source || '—')}</div>
          <div><b>Entfernung:</b> ${fmt(f.distance_km, ' km')}</div>
          <div><b>Richtung:</b> ${fmt(f.direction_deg, '°')}</div>
          <div><b>Höhe:</b> ${fmt(f.alt_m, ' m')}</div>
          <div><b>Speed:</b> ${fmt(f.speed_kmh, ' km/h')}</div>
          <div><b>HEX:</b> ${esc(f.hex || '—')}</div>
          <div><b>Grund:</b> ${esc(f.reason || '—')}</div>
        </div>
      </div>
    `).join('');

    const debugHtml = this.config.show_debug ? `
      <details class="debug">
        <summary>🛠️ Debug</summary>
        <div class="debug-grid">
          <div><b>Last update:</b> ${esc(attrs.last_update || '—')}</div>
          <div><b>Status:</b> ${esc(statusText)}</div>
          <div><b>FR24 entity:</b> ${esc(debug.fr24_entity || '—')}</div>
          <div><b>ADS-B URL:</b> ${esc(debug.adsb_url || '—')}</div>
          <div><b>ADS-B now:</b> ${esc(debug.adsb_now || '—')}</div>
          <div><b>ADS-B error:</b> ${esc(debug.adsb_error || '—')}</div>
          <div><b>Scan interval:</b> ${esc(debug.scan_interval || '—')}</div>
          <div><b>Max items:</b> ${esc(debug.max_items || '—')}</div>
        </div>
      </details>` : '';

    this.innerHTML = `
      <ha-card header="${esc(this.config.title)}">
        <div class="card-content wrapper">
          ${this.config.show_status ? `<div class="status">${esc(statusText)}</div>` : ''}
          <div class="update">Letztes Update: ${esc(attrs.last_update || '—')}</div>
          ${chips}
          <div class="countline"><b>${esc(stateObj.state)}</b> Flugzeuge erkannt</div>
          <div class="list">${rows || '<div>Keine Flüge vorhanden.</div>'}</div>
          ${debugHtml}
        </div>
      </ha-card>
      <style>
        .wrapper { display: flex; flex-direction: column; gap: 12px; }
        .status { font-weight: 600; }
        .update { opacity: 0.8; font-size: 0.95rem; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { padding: 4px 8px; border-radius: 999px; background: var(--secondary-background-color); font-size: 0.9rem; }
        .countline { font-size: 1rem; }
        .list { display: flex; flex-direction: column; gap: 12px; }
        .flight { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px; }
        .flight.tracked { border-color: var(--primary-color); }
        .head { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
        .title { font-weight: 700; }
        .track-badge { font-size: 0.75rem; padding: 2px 6px; border-radius: 999px; background: var(--primary-color); color: var(--text-primary-color); }
        .sub { opacity: 0.8; margin-top: 4px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px 12px; margin-top: 10px; }
        .debug { margin-top: 8px; }
        .debug-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px 12px; margin-top: 10px; }
      </style>
    `;
  }
}

customElements.define('air-traffic-merge-card', AirTrafficMergeCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'air-traffic-merge-card',
  name: 'Air Traffic Merge Card',
  description: 'Shows merged FR24 and ADS-B aircraft data.'
});
