const fs = require('fs');
const path = require('path');

const filesToFix = [
  { p: 'src/app/api/events/[id]/route.ts', t: 'id' },
  { p: 'src/app/api/events/[id]/guests/route.ts', t: 'id' },
  { p: 'src/app/api/events/[id]/guests/import/route.ts', t: 'id' },
  { p: 'src/app/api/events/[id]/notify/route.ts', t: 'id' },
  { p: 'src/app/api/rsvp/[token]/route.ts', t: 'token' },
  { p: 'src/app/dashboard/events/[id]/page.tsx', t: 'id' },
  { p: 'src/app/dashboard/events/[id]/guests/new/page.tsx', t: 'id' },
  { p: 'src/app/invite/[token]/page.tsx', t: 'token' }
];

for (const {p: relPath, t: paramName} of filesToFix) {
  const fileToFix = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fileToFix)) continue;
  
  let content = fs.readFileSync(fileToFix, 'utf8');

  // Fix API route signatures
  content = content.replace(
    new RegExp(`\\{ params \\}: \\{ params: \\{ ${paramName}: string \\}* \\}`, 'g'),
    `{ params }: { params: Promise<{ ${paramName}: string }> }`
  );

  // Fix usages
  content = content.replace(new RegExp(`params\\.${paramName}`, 'g'), `(await params).${paramName}`);

  fs.writeFileSync(fileToFix, content, 'utf8');
  console.log('Fixed', relPath);
}
