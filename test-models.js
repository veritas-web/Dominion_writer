const fs = require('fs');

async function test() {
  const req = await fetch('http://localhost:3000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'cmrxn0wt40000cu9wgnyyc97w', prompt: 'Hello', task: 'draft' })
  });
  console.log(await req.json());
}
test();
