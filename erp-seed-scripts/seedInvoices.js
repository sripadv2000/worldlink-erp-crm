require('dotenv').config();
const { login, getAuthenticatedAxios } = require('./login');
const colors = require('colors');

async function seedInvoices() {
  try {
    console.log(colors.yellow('\n📋 Starting Invoice Seeding...\n'));

    // Login first
    const token = await login();
    const api = getAuthenticatedAxios(token);

    // First, get list of clients to associate invoices with
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

    const count = parseInt(process.env.SEED_COUNT_INVOICES) || 15;
    const createdInvoices = [];

    console.log(colors.cyan(`📊 Creating ${count} invoices...\n`));

    for (let i = 0; i < count; i++) {
      let invoice;
      try {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const invoiceNumber = 1000 + i + 1;
        const currentDate = new Date();
        const expiredDate = new Date();
        expiredDate.setDate(currentDate.getDate() + 30);

        const items = [
          {
            itemName: `Professional Services - Package ${i + 1}`,
            description: 'Consulting and implementation services',
            quantity: Math.floor(Math.random() * 10) + 1,
            price: (Math.floor(Math.random() * 500) + 100),
            total: 0,
          },
          {
            itemName: 'Software License',
            description: 'Annual software subscription',
            quantity: 1,
            price: (Math.floor(Math.random() * 1000) + 500),
            total: 0,
          },
        ];

        // Calculate totals
        items.forEach(item => {
          item.total = item.quantity * item.price;
        });

        // ONLY include fields from schemaValidate.js
        invoice = {
          client: client._id,
          number: invoiceNumber,
          year: currentDate.getFullYear(),
          status: i % 4 === 0 ? 'sent' : 'draft',
          notes: `Invoice for services rendered - ${currentDate.toLocaleDateString()}`,
          expiredDate: expiredDate,
          date: currentDate,
          items: items,
          taxRate: 10
        };

        const response = await api.post('/invoice/create', invoice);

        if (response.data && response.data.success) {
          createdInvoices.push(response.data.result);
          console.log(colors.green(`✅ Created invoice #${invoiceNumber} for ${client.name}`));
        } else {
          console.log(colors.red(`❌ Failed to create invoice #${invoiceNumber}`));
        }
      } catch (error) {
        console.log(colors.red(`❌ Error creating invoice: ${error.message}`));
        if (error.response && error.response.data) {
          console.log(colors.red(`   Backend Response: ${JSON.stringify(error.response.data, null, 2)}`));
        }
        if (i === 0 && invoice) {
          console.log(colors.yellow(`   Failed Invoice Data: ${JSON.stringify(invoice, null, 2)}`));
        }
      }
    }

    console.log(colors.green(`\n✅ Successfully created ${createdInvoices.length} invoices!`));
    console.log(colors.gray(`Total attempted: ${count}`));

    return createdInvoices;
  } catch (error) {
    console.error(colors.red('\n❌ Invoice seeding failed!'));
    console.error(colors.red(error.message));
    if (error.response && error.response.data) {
      console.log(colors.red(`   Details: ${JSON.stringify(error.response.data, null, 2)}`));
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedInvoices()
    .then(() => {
      console.log(colors.green('\n🎉 Invoice seeding completed!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(colors.red('\n💥 Invoice seeding failed!'));
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedInvoices;
