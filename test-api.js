const userId = "cmrxn0wt40000cu9wgnyyc97w"; 

async function test() {
  const res = await fetch('http://localhost:3000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, prompt: 'Write a short story about a brave knight.', task: 'draft' })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

test();
