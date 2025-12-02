require('dotenv').config();
const { login, getAuthenticatedAxios } = require('./login');
const colors = require('colors');

async function seedPayments() {
  try {
    console.log(colors.yellow('\n📋 Starting Payment Seeding...\n'));

    // Login first
    const token = await login();
    const api = getAuthenticatedAxios(token);

    // Get list of invoices to create payments for
    console.log(colors.cyan('📊 Fetching invoices...'));
    const invoicesResponse = await api.get('/invoice/list?items=50');

    if (!invoicesResponse.data || !invoicesResponse.data.success || !invoicesResponse.data.result) {
      throw new Error('No invoices found. Please run seedInvoices.js first!');
    }

    const invoices = invoicesResponse.data.result;
    console.log(colors.green(`✅ Found ${invoices.length} invoices\n`));

    if (invoices.length === 0) {
      throw new Error('No invoices available. Please run seedInvoices.js first!');
    }

    // Get payment modes
    console.log(colors.cyan('📊 Fetching payment modes...'));
    const paymentModesResponse = await api.get('/paymentmode/list');
    let paymentModeId = null;

    if (paymentModesResponse.data && paymentModesResponse.data.success && paymentModesResponse.data.result) {
      const modes = paymentModesResponse.data.result;
      if (modes.length > 0) {
        paymentModeId = modes[0]._id;
        console.log(colors.green(`✅ Found payment mode: ${modes[0].name}\n`));
      }
    }

    const count = Math.min(parseInt(process.env.SEED_COUNT_PAYMENTS) || 5, invoices.length);
    const createdPayments = [];

    console.log(colors.cyan(`📊 Creating ${count} payments...\n`));

    for (let i = 0; i < count; i++) {
      try {
        const invoice = invoices[i];
        const paymentAmount = invoice.total || 1000; // Fallback amount

        const payment = {
          number: 3000 + i + 1,
          client: invoice.client?._id || invoice.client,
          invoice: invoice._id,
          date: new Date().toISOString(),
          amount: paymentAmount,
          currency: invoice.currency || 'USD',
          paymentMode: paymentModeId,
          ref: `PAY-${Date.now()}-${i}`,
          description: `Payment for Invoice #${invoice.number || (i + 1)}`,
        };

        const response = await api.post('/payment/create', payment);

        if (response.data && response.data.success) {
          createdPayments.push(response.data.result);
          console.log(colors.green(`✅ Created payment #${payment.number} for $${paymentAmount}`));
        } else {
          console.log(colors.red(`❌ Failed to create payment #${payment.number}`));
        }
      } catch (error) {
        console.log(colors.red(`❌ Error creating payment: ${error.message}`));
      }
    }

    console.log(colors.green(`\n✅ Successfully created ${createdPayments.length} payments!`));
    console.log(colors.gray(`Total attempted: ${count}`));

    return createdPayments;
  } catch (error) {
    console.error(colors.red('\n❌ Payment seeding failed!'));
    console.error(colors.red(error.message));
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPayments()
    .then(() => {
      console.log(colors.green('\n🎉 Payment seeding completed!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(colors.red('\n💥 Payment seeding failed!'));
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedPayments;
