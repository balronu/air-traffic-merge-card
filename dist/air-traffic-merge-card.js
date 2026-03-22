class AirTrafficMergeCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error('entity erforderlich');
    }
    this._config = {
      title: 'Flugzeuge',
      show_status: true,
      show_debug: false,
      show_counts: true,
      max_items: 25,
      compact: false,
      ...config,
    };
  }

  getCardSize() {
    return this._config?.compact ? 5 : 8;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _escape(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _fmtNumber(value, digits = 0) {
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  _fmtDistance(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return `${this._fmtNumber(num, 1)} km`;
  }

  _statusText(attrs) {
    const hasFr24 = Number(attrs.fr24_count ?? 0) > 0;
    const hasAdsb = Number(attrs.adsb_count ?? 0) > 0;

    if (hasFr24 && hasAdsb) return '✅ FR24 + ADS-B verfügbar';
    if (hasAdsb) return '📡 Nur lokales ADS-B aktiv';
    if (hasFr24) return '🌍 Nur FR24 aktiv';
    return '❌ Keine Flugdaten verfügbar';
  }

  _categoryChip(label, value, icon) {
    return `
      <div class="atm-chip">
        <span class="atm-chip-icon">${icon}</span>
        <span class="atm-chip-label">${this._escape(label)}</span>
        <span class="atm-chip-value">${this._fmtNumber(value)}</span>
      </div>
    `;
  }

  _flightRow(f) {
    const tracked = f.tracked ? '<span class="atm-badge atm-badge-tracked">TRACKED</span>' : '';
    const source = this._escape(f.source_text || '—');
    const category = this._escape(f.category || '—');
    const reason = this._escape(f.reason || '—');
    const callsign = this._escape(f.name || f.callsign || 'Unbekannt');
    const operator = this._escape(f.airline || 'Operator unbekannt');
    const typeName = this._escape(f.type_name || 'Typ unbekannt');
    const reg = this._escape(f.registration || 'unbekannt');
    const typecode = this._escape(f.typecode || '—');
    const hex = this._escape(f.hex || '—');
    const dist = this._fmtDistance(f.dist_km);
    const alt = f.alt_m == null ? '—' : `${this._fmtNumber(f.alt_m)} m`;
    const spd = f.spd_kmh == null ? '—' : `${this._fmtNumber(f.spd_kmh)} km/h`;
    const dir = f.dir_deg == null ? '—' : `${this._fmtNumber(f.dir_deg)}°`;

    return `
      <div class="atm-flight">
        <div class="atm-flight-top">
          <div class="atm-flight-name">${callsign}</div>
          <div class="atm-flight-badges">
            <span class="atm-badge">${category}</span>
            ${tracked}
          </div>
        </div>
        <div class="atm-flight-sub">${operator} • ${typeName}</div>
        <div class="atm-metrics">
          <div><span>Reg</span><strong>${reg}</strong></div>
          <div><span>Type</span><strong>${typecode}</strong></div>
          <div><span>HEX</span><strong>${hex}</strong></div>
          <div><span>Quelle</span><strong>${source}</strong></div>
          <div><span>Entfernung</span><strong>${dist}</strong></div>
          <div><span>Höhe</span><strong>${alt}</strong></div>
          <div><span>Speed</span><strong>${spd}</strong></div>
          <div><span>Kurs</span><strong>${dir}</strong></div>
        </div>
        <div class="atm-reason">${reason}</div>
      </div>
    `;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) {
      this.innerHTML = `<ha-card><div class="card-content">Entity nicht gefunden: ${this._escape(this._config.entity)}</div></ha-card>`;
      return;
    }

    const attrs = stateObj.attributes || {};
    const flights = Array.isArray(attrs.flights) ? attrs.flights.slice(0, this._config.max_items) : [];
    const counts = attrs.counts || {};
    const debug = attrs.debug || {};
    const total = Number(stateObj.state || 0);
    const lastUpdate = attrs.last_update
      ? new Date(attrs.last_update * 1000).toLocaleString()
      : '—';

    this.innerHTML = `
      <ha-card>
        <style>
          .atm-card { padding: 16px; }
          .atm-header { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:12px; }
          .atm-title { font-size: 1.15rem; font-weight: 600; line-height:1.2; }
          .atm-subtitle { color: var(--secondary-text-color); margin-top: 4px; font-size: 0.92rem; }
          .atm-total { font-size: 1.8rem; font-weight: 700; line-height:1; white-space:nowrap; }
          .atm-status { margin: 10px 0 14px; padding: 10px 12px; border-radius: 14px; background: var(--secondary-background-color); color: var(--primary-text-color); }
          .atm-status-small { color: var(--secondary-text-color); font-size:0.86rem; margin-top:4px; }
          .atm-chips { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px; margin-bottom: 14px; }
          .atm-chip { background: var(--secondary-background-color); border-radius: 16px; padding: 10px 12px; display:flex; flex-direction:column; gap:4px; min-height:72px; }
          .atm-chip-icon { font-size: 1.1rem; }
          .atm-chip-label { font-size: 0.82rem; color: var(--secondary-text-color); }
          .atm-chip-value { font-size: 1.25rem; font-weight: 700; }
          .atm-list { display:flex; flex-direction:column; gap:10px; }
          .atm-flight { border: 1px solid var(--divider-color); border-radius: 16px; padding: 12px; }
          .atm-flight-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
          .atm-flight-name { font-weight:700; font-size:1rem; }
          .atm-flight-sub { margin-top:4px; color: var(--secondary-text-color); }
          .atm-flight-badges { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
          .atm-badge { font-size:0.72rem; line-height:1; padding: 6px 8px; border-radius: 999px; background: var(--secondary-background-color); }
          .atm-badge-tracked { font-weight:700; }
          .atm-metrics { margin-top:10px; display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px 12px; }
          .atm-metrics div { display:flex; flex-direction:column; }
          .atm-metrics span { font-size:0.75rem; color: var(--secondary-text-color); }
          .atm-metrics strong { font-size:0.92rem; }
          .atm-reason { margin-top:10px; font-size:0.8rem; color: var(--secondary-text-color); }
          .atm-empty { color: var(--secondary-text-color); padding: 8px 0 2px; }
          .atm-debug { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
          .atm-debug h4 { margin: 0 0 8px; font-size: 0.95rem; }
          .atm-debug pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-family: var(--code-font-family, monospace); font-size: 0.78rem; color: var(--secondary-text-color); }
          @media (max-width: 520px) {
            .atm-chips { grid-template-columns: repeat(2, minmax(0,1fr)); }
            .atm-header { flex-direction:column; }
            .atm-metrics { grid-template-columns: 1fr 1fr; }
          }
        </style>
        <div class="atm-card">
          <div class="atm-header">
            <div>
              <div class="atm-title">${this._escape(this._config.title)}</div>
              <div class="atm-subtitle">Letztes Update: ${this._escape(lastUpdate)}</div>
            </div>
            <div class="atm-total">${this._fmtNumber(total)}</div>
          </div>
          ${this._config.show_status ? `
            <div class="atm-status">
              <div>${this._statusText(attrs)}</div>
              <div class="atm-status-small">FR24: ${this._fmtNumber(attrs.fr24_count ?? 0)} • ADS-B: ${this._fmtNumber(attrs.adsb_count ?? 0)} • Zusammengeführt: ${this._fmtNumber(attrs.merged_count ?? 0)}</div>
            </div>
          ` : ''}
          ${this._config.show_counts ? `
            <div class="atm-chips">
              ${this._categoryChip('Medical', counts.medical ?? 0, '🚁')}
              ${this._categoryChip('Military', counts.military ?? 0, '🛡️')}
              ${this._categoryChip('Helicopter', counts.helicopter ?? 0, '🚁')}
              ${this._categoryChip('Business', counts.business ?? 0, '💼')}
              ${this._categoryChip('GA', counts.general_aviation ?? 0, '🛩️')}
              ${this._categoryChip('Civil', counts.civil ?? 0, '✈️')}
            </div>
          ` : ''}
          <div class="atm-list">
            ${flights.length
              ? flights.map((f) => this._flightRow(f)).join('')
              : '<div class="atm-empty">Keine Flüge vorhanden.</div>'}
          </div>
          ${this._config.show_debug ? `
            <div class="atm-debug">
              <h4>Debug</h4>
              <pre>${this._escape(JSON.stringify(debug, null, 2))}</pre>
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
  }
}

customElements.define('air-traffic-merge-card', AirTrafficMergeCard);
