import fs from 'fs';

let code = fs.readFileSync('src/data/tidings.ts', 'utf-8');

const fusedPrompts = [
  'fusion double exposure of modern military warships in ocean at night AND ancient biblical prophecies fiery sky',
  'realistic Pentagon building fused intimately with AI neural network glowing nodes AND ancient eschatological Revelation beast imagery in the clouds cinematic',
  'black toxic rain falling over modern Tehran city skyline AND apocalyptic flaming sky Joel biblical blood moon prophecy',
  'modern Iranian military command room with a shadowy leader AND ancient Shia Mahdi apocalyptic fiery symbols glowing cinematic',
  'modern medical workers in hazmat suits in outbreak hospital AND the Pale Horse of the Apocalypse from Revelation galloping through fog',
  'modern wall street trading floor with falling graphs and gold bars AND ancient Babylon collapsing in apocalyptic flames',
  'cyberpunk biometric eye scan for European digital ID AND glowing ancient biblical Mark of the Beast red runes superimposed',
  'massive modern earthquake rubble search rescue at night AND biblical Matthew 24 end times signs in the heavens lightning',
  'modern Chinese and Russian aircraft carriers fleet in the Pacific ocean AND biblical Kings of the East Revelation apocalyptic storm',
  'interior of Vatican St Peters basilica with futuristic holographic AI interfaces AND Book of Revelation eschatological fiery prophecy symbols blending',
  'depressed modern teenager staring into a glowing smartphone in a dark room AND apocalyptic freezing cold winter wasteland representing love growing cold',
  'massive solar flare hitting earth satellites with northern lights over modern city AND biblical Revelation 8 apocalyptic darkening of the stars'
];

for (let i = 0; i < 12; i++) {
  const prompt = encodeURIComponent(fusedPrompts[i]);
  const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1920&nologo=true&seed=888`;
  
  const idStr = `id: "${i+1}",`;
  const rx = new RegExp(`id: "${i+1}",\\s+realWorldImage: "[^"]+",`);
  
  if (rx.test(code)) {
    code = code.replace(rx, `id: "${i+1}",\n    realWorldImage: "${imgUrl}",`);
  }
}

fs.writeFileSync('src/data/tidings.ts', code);
console.log('Update finished.');