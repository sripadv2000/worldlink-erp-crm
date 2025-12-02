require('dotenv').config();
const { login, getAuthenticatedAxios } = require('./login');
const colors = require('colors');

async function seedQuotes() {
  try {
    console.log(colors.yellow('\n📋 Starting Quote Seeding...\n'));

    // Login first
    const token = await login();
    const api = getAuthenticatedAxios(token);

    // First, get list of clients
    console.log(colors.cyan('📊 Fetching clients...'));
    const clientsResponse = await api.get('/client/list?items=20');

    if (!clientsResponse.data || !clientsResponse.data.success || !clientsResponse.data.result) {
      throw new Error('No clients found. Please run seedClients.js first!');
    }

    const clients = clientsResponse.data.result;
    console.log(colors.green(`✅ Found ${clients.length} clients\n`));

    if (clients.length === 0) {
      throw new Error('No clients available. Please run seedClients.js first!');
    }

    const count = parseInt(process.env.SEED_COUNT_QUOTES) || 10;
    const createdQuotes = [];

    console.log(colors.cyan(`📊 Creating ${count} quotes...\n`));

    for (let i = 0; i < count; i++) {
      try {
        // Pick a random client
        const client = clients[Math.floor(Math.random() * clients.length)];

        // Generate quote data
        const quoteNumber = 2000 + i + 1;
        const currentDate = new Date();
        const expiredDate = new Date();
        expiredDate.setDate(currentDate.getDate() + 15); // 15 days validity

        const items = [
          {
            itemName: `Solution Package ${i + 1}`,
            description: 'Comprehensive business solution package',
            quantity: Math.floor(Math.random() * 5) + 1,
            price: (Math.floor(Math.random() * 800) + 200),
            total: 0,
          },
          {
            itemName: 'Implementation Services',
            description: 'Professional setup and configuration',
            quantity: Math.floor(Math.random() * 20) + 10,
            price: 150,
            total: 0,
          },
        ];

        // Calculate totals
        items.forEach(item => {
          item.total = item.quantity * item.price;
        });

        const subTotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = 10;
        const taxTotal = (subTotal * taxRate) / 100;
        const total = subTotal + taxTotal;

        const quote = {
          number: quoteNumber,
          year: currentDate.getFullYear(),
          date: currentDate.toISOString(),
          expiredDate: expiredDate.toISOString(),
          client: client._id,
          items: items,
          taxRate: taxRate,
          subTotal: subTotal,
          taxTotal: taxTotal,
          total: total,
          currency: 'USD',
          discount: 0,
          status: i % 3 === 0 ? 'sent' : 'draft', // 33% sent, 67% draft
          notes: `Quote for proposed services - Valid until ${expiredDate.toLocaleDateString()}`,
        };

        const response = await api.post('/quote/create', quote);

        if (response.data && response.data.success) {
          createdQuotes.push(response.data.result);
          console.log(colors.green(`✅ Created quote #${quoteNumber} for ${client.name}`));
        } else {
          console.log(colors.red(`❌ Failed to create quote #${quoteNumber}`));
        }
      } catch (error) {
        console.log(colors.red(`❌ Error creating quote: ${error.message}`));
      }
    }

    console.log(colors.green(`\n✅ Successfully created ${createdQuotes.length} quotes!`));
    console.log(colors.gray(`Total attempted: ${count}`));

    return createdQuotes;
  } catch (error) {
    console.error(colors.red('\n❌ Quote seeding failed!'));
    console.error(colors.red(error.message));
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedQuotes()
    .then(() => {
      console.log(colors.green('\n🎉 Quote seeding completed!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(colors.red('\n💥 Quote seeding failed!'));
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedQuotes;
