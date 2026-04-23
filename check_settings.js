async function check() {
  const res = await fetch('http://localhost:5001/api/public/settings');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
check();
