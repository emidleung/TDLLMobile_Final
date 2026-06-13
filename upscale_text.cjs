const fs = require('fs');
const files = [
  'src/components/HelperDashboard.tsx',
  'src/components/EmployerDashboard.tsx'
];

const replacements = [
  [/text-\[32px\]/g, 'text-[34px]'],
  [/text-\[30px\]/g, 'text-[32px]'],
  [/text-\[26px\]/g, 'text-[28px]'],
  [/text-\[22px\]/g, 'text-[24px]'],
  [/text-\[20px\]/g, 'text-[22px]'],
  [/text-\[18px\]/g, 'text-[20px]'],
  [/text-\[16px\]/g, 'text-[18px]'],
  [/text-\[15px\]/g, 'text-[16px]'],
  [/text-\[14px\]/g, 'text-[15px]'],
  [/text-\[13px\]/g, 'text-[14px]'],
  [/text-\[11px\]/g, 'text-[12px]'],
  [/text-\[10px\]/g, 'text-[11px]'],
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Text scaled UP by 1 size in dashboards.');
