# Air Traffic Merge Card Local

Lovelace card for the Air Traffic Merge integration, optimized for **local ADS-B** / `adsb.im` setups.

This repo is structured so you can upload it to GitHub as-is and add it to HACS as a custom dashboard repository.

## Highlights

- Clean Home Assistant card layout
- Works with ADS-B-only and FR24 + ADS-B setups
- Count chips for Medical, Military, Helicopter, Business, GA and Civil
- Flight rows with source, distance, altitude, speed, heading and detection reason
- Optional status and debug sections

## Repository structure

```text
dist/air-traffic-merge-card.js
hacs.json
README.md
LICENSE
.gitignore
```

## Install with HACS

1. Create a new GitHub repository, for example `air-traffic-merge-card-local`
2. Upload the contents of this repo
3. In HACS, open **Custom repositories**
4. Add your GitHub repo URL
5. Choose **Dashboard**
6. Install **Air Traffic Merge Card Local**
7. Add the card resource if HACS does not do it automatically

## Manual install

Copy this file:

```text
dist/air-traffic-merge-card.js
```

into:

```text
/config/www/air-traffic-merge-card.js
```

Then add this Lovelace resource:

```yaml
url: /local/air-traffic-merge-card.js
type: module
```

## Example card

```yaml
type: custom:air-traffic-merge-card
entity: sensor.air_traffic_merge
title: Flugzeuge
show_status: true
show_counts: true
show_debug: false
max_items: 25
```

## Recommended pairing

Use this together with the integration repo:

- `air-traffic-merge-local`

## Notes

- The original idea and base structure come from `balronu/air-traffic-merge-card`
- This repo is cleaned up so you can publish it directly as your own card repo
