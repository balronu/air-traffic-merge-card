class AirTrafficMergeCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("entity erforderlich");
    }
    this._config = {
      title: "Flugzeuge",
      show_status: true,
      show_debug: false,
      max_items: 25,
      ...config,
    };
  }

  getCardSize() {
    return 6;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) {
      this.innerHTML = `<ha-card header="${this._config.title}"><div class="card-content">Entity nicht gefunden: ${this._config.entity}</div></ha-card>`;
      return;
    }

    const attrs = stateObj.attributes || {};
    const flights = (attrs.flights || []).slice(0, this._config.max_items);
    const counts = attrs.counts || {};
    const debug = attrs.debug || {};

    const escapeHtml = (str) =>
      String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const statusMap = {
      both: "✅ Beide Quellen liefern Daten",
      fr24_only: "⚠️ Nur FR24 verfügbar",
      adsb_only: "⚠️ Nur ADS-B verfügbar",
      empty: "❌ Keine Flugdaten verfügbar",
    };

    let html = `
      <ha-card header="${escapeHtml(this._config.title)}">
        <div class="atm-wrap">
          <div class="atm-top">
            <div><b>${stateObj.state}</b> Flugzeuge erkannt</div>
            <div>Letztes Update: ${attrs.last_update ? new Date(attrs.last_update * 1000).toLocaleString() : "—"}</div>
          </div>
    `;

    if (this._config.show_status) {
      html += `
        <div class="atm-status">
          <div>FR24: <b>${attrs.fr24_count ?? 0}</b></div>
          <div>ADS-B: <b>${attrs.adsb_count ?? 0}</b></div>
          <div>Zusammengeführt: <b>${attrs.merged_count ?? 0}</b></div>
          <div>${statusMap[attrs.status] || attrs.status || "—"}</div>
        </div>
        <div class="atm-counts">
          <span>🚑 ${counts.medical ?? 0}</span>
          <span>🪖 ${counts.military ?? 0}</span>
          <span>🚁 ${counts.helicopter ?? 0}</span>
          <span>💼 ${counts.business ?? 0}</span>
          <span>🛩️ ${counts.general_aviation ?? 0}</span>
          <span>✈️ ${counts.civil ?? 0}</span>
        </div>
      `;
    }

    if (!flights.length) {
      html += `<div class="atm-empty">Keine Flüge vorhanden.</div>`;
    } else {
      html += `<div class="atm-list">`;
      for (const f of flights) {
        html += `
          <div class="atm-item ${f.tracked ? "tracked" : ""}">
            <div class="atm-name">${escapeHtml(f.name || "Unbekannt")}</div>
            <div class="atm-meta">${escapeHtml(f.airline || "")} ${escapeHtml(f.type_name || "")}</div>
            <div class="atm-grid">
              <div><b>Kennung:</b> ${escapeHtml(f.registration || "unbekannt")}</div>
              <div><b>Typcode:</b> ${escapeHtml(f.typecode || "—")}</div>
              <div><b>Kategorie:</b> ${escapeHtml(f.category || "—")}</div>
              <div>${escapeHtml(f.source_text || "—")}</div>
              <div><b>HEX:</b> ${escapeHtml(f.hex || "—")}</div>
              <div><b>Grund:</b> ${escapeHtml(f.reason || "—")}</div>
            </div>
          </div>
        `;
      }
      html += `</div>`;
    }

    if (this._config.show_debug) {
      html += `
        <details class="atm-debug">
          <summary><b>Debug</b></summary>
          <div>FR24 Entity: ${escapeHtml(debug.fr24_entity || "—")}</div>
          <div>ADS-B URL: ${escapeHtml(debug.adsb_url || "—")}</div>
          <div>ADS-B now: ${escapeHtml(debug.adsb_now || "—")}</div>
          <div>ADS-B error: ${escapeHtml(debug.adsb_error || "—")}</div>
          <div>Scan-Intervall: ${escapeHtml(debug.scan_interval || "—")}</div>
          <div>Max Items: ${escapeHtml(debug.max_items || "—")}</div>
        </details>
      `;
    }

    html += `
        </div>
      </ha-card>
      <style>
        .atm-wrap { padding: 16px; }
        .atm-top { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
        .atm-status, .atm-counts { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
        .atm-list { display:flex; flex-direction:column; gap:12px; }
        .atm-item { border:1px solid rgba(127,127,127,.25); border-radius:12px; padding:12px; }
        .atm-item.tracked { border-width:2px; }
        .atm-name { font-weight:700; font-size:1.05rem; margin-bottom:4px; }
        .atm-meta { opacity:.8; margin-bottom:8px; }
        .atm-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:6px 12px; }
        .atm-empty { opacity:.8; }
        .atm-debug { margin-top:12px; }
      </style>
    `;

    this.innerHTML = html;
  }
}

customElements.define("air-traffic-merge-card", AirTrafficMergeCard);
