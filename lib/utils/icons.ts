import type { POICategory } from '@/lib/types'

export function createSearchIcon(): string {
  return `
    <div style="
      width:36px;height:44px;
      display:flex;flex-direction:column;align-items:center;
    ">
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:#EF4444;border:3px solid #fff;
        transform:rotate(-45deg);
        box-shadow:0 2px 12px rgba(239,68,68,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);width:10px;height:10px;background:#fff;border-radius:50%;"></div>
      </div>
    </div>
  `
}

export function createUserIcon(): string {
  return `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(59,130,246,0.25);
        animation:pulse 2s infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:14px;height:14px;border-radius:50%;
        background:#3B82F6;border:2.5px solid #fff;
        box-shadow:0 0 0 2px rgba(59,130,246,0.4);
      "></div>
    </div>
  `
}

const POI_COLORS: Record<POICategory, string> = {
  restaurant: '#F59E0B',
  hospital: '#EF4444',
  fuel: '#8B5CF6',
  hotel: '#EC4899',
  atm: '#10B981',
  parking: '#6366F1',
  pharmacy: '#14B8A6',
  school: '#3B82F6',
  cafe: '#D97706',
  supermarket: '#84CC16',
}

export function createPOIIcon(category: POICategory): string {
  const color = POI_COLORS[category] || '#6B7280'
  return `
    <div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      font-size:12px;
    ">
      ${getPOIEmoji(category)}
    </div>
  `
}

export function createIncidentIcon(severity: number): string {
  const colors = ['', '#F59E0B', '#F97316', '#EF4444', '#991B1B']
  const color = colors[severity] || '#EF4444'
  return `
    <div style="
      width:28px;height:28px;
      background:${color};
      border:2px solid #fff;
      border-radius:6px;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      transform:rotate(45deg);
    ">
      <span style="transform:rotate(-45deg);">⚠</span>
    </div>
  `
}

function getPOIEmoji(category: POICategory): string {
  const map: Record<POICategory, string> = {
    restaurant: '🍽',
    hospital: '🏥',
    fuel: '⛽',
    hotel: '🏨',
    atm: '🏧',
    parking: 'P',
    pharmacy: '💊',
    school: '🏫',
    cafe: '☕',
    supermarket: '🛒',
  }
  return map[category] || '📍'
}
