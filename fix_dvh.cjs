const fs = require('fs');
const path = require('path');

const dir = 'c:\\indhumathiGarments\\indhumathiGarments-frontend\\src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

let count = 0;
walk(dir).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('100lvh')) {
    content = content.replace(/100lvh/g, '100dvh');
    changed = true;
  }
  if (content.includes('100vh')) {
    content = content.replace(/100vh/g, '100dvh');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
});
console.log(`Replaced in ${count} files.`);
