async function check() {
  const res = await fetch('https://api.indhumathigarments.com/api/public/settings');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
check();
