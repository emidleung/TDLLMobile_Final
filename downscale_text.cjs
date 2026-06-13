const fs = require('fs');
const files = [
  'src/components/HelperDashboard.tsx',
  'src/components/EmployerDashboard.tsx'
];

const replacements = [
  [/text-\[40px\]/g, 'text-[32px]'],
  [/text-\[38px\]/g, 'text-[30px]'],
  [/text-\[34px\]/g, 'text-[26px]'],
  [/text-\[28px\]/g, 'text-[22px]'],
  [/text-\[24px\]/g, 'text-[20px]'],
  [/text-\[22px\]/g, 'text-[18px]'],
  [/text-\[20px\]/g, 'text-[16px]'],
  [/text-\[18px\]/g, 'text-[15px]'],
  [/text-\[16px\]/g, 'text-[14px]'],
  [/text-\[14px\]/g, 'text-[13px]'],
  [/text-\[12px\]/g, 'text-[11px]'],
  [/text-\[11px\]/g, 'text-[10px]'],
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Text scaled down in dashboards.');
