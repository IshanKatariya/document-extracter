const fs = require('fs');

async function main() {
  try {
    const buf = fs.readFileSync('test.pdf');
    const fd = new FormData();
    fd.append('file', new Blob([buf], { type: 'application/pdf' }), 'test.pdf');

    const res = await fetch('http://localhost:3001/api/process', {
      method: 'POST',
      body: fd,
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error('ERR', e);
  }
}

main();