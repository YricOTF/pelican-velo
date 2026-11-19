export const defaultMapId = 'coast';

export const maps = Object.freeze([
  Object.freeze({
    id: 'coast',
    name: '海风环线',
    label: 'PELICAN LOOP',
    description: '沿着浅滩、棕榈和灯塔骑行。',
  }),
  Object.freeze({
    id: 'harbor',
    name: '月牙港',
    label: 'CRESCENT HARBOR',
    description: '绕过港湾的粉色沙滩和陶瓦渔村。',
  }),
  Object.freeze({
    id: 'basalt',
    name: '黑岩岬',
    label: 'BASALT CAPE',
    description: '从黑沙海岸驶向迎风的玄武岩群。',
  }),
]);

export function getMap(mapId) {
  return maps.find(({ id }) => id === mapId) ?? maps[0];
}
