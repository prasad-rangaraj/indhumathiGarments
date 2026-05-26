const pg = require('../indhumathiGarments-backend/node_modules/pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://garments_user:StrongPass123@localhost:5433/indhumathi_garments' });
  await client.connect();
  try {
    await client.query(`UPDATE "product" SET description = REPLACE(description, 'active women', 'active individuals')`);
    await client.query(`UPDATE "product" SET description = REPLACE(description, 'women', 'individuals')`);
    await client.query(`UPDATE "product" SET description = REPLACE(description, 'Women', 'Individuals')`);
    await client.query(`UPDATE "product" SET description = REPLACE(description, 'lingerie', 'innerwear')`);
    await client.query(`UPDATE "product" SET description = REPLACE(description, 'Lingerie', 'Innerwear')`);
    console.log('Descriptions updated successfully!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
