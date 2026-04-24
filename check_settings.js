async function check() {
  const res = await fetch('http://43.204.150.118/api/public/settings');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
check();
