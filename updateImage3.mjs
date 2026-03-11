import fs from 'fs';

const file = 'src/data/tidings.ts';
let code = fs.readFileSync(file, 'utf8');

// The replacement logic:
// 1. Find the realWorldImage lines. 
// 2. Add '&model=flux' to the URL right before the matching quote if not present.
code = code.replace(/realWorldImage: ['"](https:\/\/image\.pollinations\.ai\/prompt\/[^'"]+)['"]/g, (match, url) => {
    if (url.includes('model=flux')) return match;
    const separator = url.includes('?') ? '&' : '?';
    return `realWorldImage: '${url}${separator}model=flux'`;
});

fs.writeFileSync(file, code);
console.log('Added model=flux to Pollinations URLs');
