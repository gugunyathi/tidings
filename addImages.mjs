import fs from 'fs';

let code = fs.readFileSync('src/data/tidings.ts', 'utf-8');

const mapping = [
  'military warships in ocean at night cinematic realistic',
  'pentagon military server room glowing circuit board realistic',
  'black toxic rain falling over middle eastern city skyline smoke dark clouds realistic',
  'persian military command room shadowy figure cinematic realistic',
  'hazmat suit medical workers outbreak hospital ward dark realistic',
  'gold bars and falling stock market graphs financial trading floor realistic',
  'digital identity biometric eye scan cyberpunk surveillance europe realistic',
  'massive earthquake rubble destroyed buildings search rescue night realistic',
  'massive naval fleet aircraft carriers ocean pacific military realistic',
  'vatican st peters basilica interior glowing hologram religious cinematic',
  'depressed teenager in dark room illuminated by smartphone screen lonely realistic',
  'northern lights aurora over modern city skyline massive solar storm realistic'
];

for (let i = 0; i < 12; i++) {
  const idStr2 = `id: "${i+1}"`;
  const prompt = mapping[i].replace(/ /g, '%20');
  const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1920&nologo=true&seed=42`;
  
  if (code.includes(idStr2)) {
    code = code.replace(idStr2, `${idStr2},\n    realWorldImage: "${imgUrl}"`);
  }
}

fs.writeFileSync('src/data/tidings.ts', code);
console.log('Done!');
