require('dotenv').config();
const { login, getAuthenticatedAxios } = require('./login');
const colors = require('colors');

const sampleClients = [
  {
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    phone: '+1-555-0101',
    country: 'United States',
    address: '123 Business St, New York, NY 10001',
  },
  {
    name: 'TechStart Inc',
    email: 'info@techstart.io',
    phone: '+1-555-0102',
    country: 'United States',
    address: '456 Innovation Ave, San Francisco, CA 94105',
  },
  {
    name: 'Global Solutions Ltd',
    email: 'contact@globalsolutions.com',
    phone: '+44-20-7123-4567',
    country: 'United Kingdom',
    address: '789 Commerce Road, London, EC1A 1BB',
  },
  {
    name: 'Digital Dynamics',
    email: 'hello@digitaldynamics.com',
    phone: '+1-555-0103',
    country: 'United States',
    address: '321 Tech Park, Austin, TX 78701',
  },
  {
    name: 'Innovative Systems',
    email: 'contact@innovativesys.com',
    phone: '+1-555-0104',
    country: 'United States',
    address: '654 Enterprise Blvd, Seattle, WA 98101',
  },
  {
    name: 'Prime Enterprises',
    email: 'info@primeenterprises.com',
    phone: '+1-555-0105',
    country: 'Canada',
    address: '987 Corporate Dr, Toronto, ON M5H 2N2',
  },
  {
    name: 'Quantum Technologies',
    email: 'contact@quantumtech.com',
    phone: '+1-555-0106',
    country: 'United States',
    address: '147 Research Park, Boston, MA 02108',
  },
  {
    name: 'NextGen Solutions',
    email: 'hello@nextgensol.com',
    phone: '+1-555-0107',
    country: 'United States',
    address: '258 Future Lane, Denver, CO 80202',
  },
  {
    name: 'Sunrise Industries',
    email: 'info@sunriseindustries.com',
    phone: '+1-555-0108',
    country: 'United States',
    address: '369 Manufacturing Way, Chicago, IL 60601',
  },
  {
    name: 'Coastal Trading Co',
    email: 'contact@coastaltrading.com',
    phone: '+1-555-0109',
    country: 'United States',
    address: '741 Harbor View, Miami, FL 33101',
  },
];

async function seedClients() {
  try {
    console.log(colors.yellow('\n📋 Starting Client Seeding...\n'));

    // Login first
    const token = await login();
    const api = getAuthenticatedAxios(token);

    const count = parseInt(process.env.SEED_COUNT_CLIENTS) || sampleClients.length;
    const clientsToSeed = sampleClients.slice(0, count);

    console.log(colors.cyan(`\n📊 Creating ${clientsToSeed.length} clients...\n`));

    const createdClients = [];

    for (const client of clientsToSeed) {
      try {
        const response = await api.post('/client/create', client);

        if (response.data && response.data.success) {
          createdClients.push(response.data.result);
          console.log(colors.green(`✅ Created client: ${client.name}`));
        } else {
          console.log(colors.red(`❌ Failed to create client: ${client.name}`));
        }
      } catch (error) {
        console.log(colors.red(`❌ Error creating client ${client.name}: ${error.message}`));
      }
    }

    console.log(colors.green(`\n✅ Successfully created ${createdClients.length} clients!`));
    console.log(colors.gray(`Total attempted: ${clientsToSeed.length}`));

    return createdClients;
  } catch (error) {
    console.error(colors.red('\n❌ Client seeding failed!'));
    console.error(colors.red(error.message));
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedClients()
    .then(() => {
      console.log(colors.green('\n🎉 Client seeding completed!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(colors.red('\n💥 Client seeding failed!'));
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedClients;
