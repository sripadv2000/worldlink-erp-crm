require('dotenv').config();
const colors = require('colors');

// Import all seed functions
const seedClients = require('./seedClients');
const seedInvoices = require('./seedInvoices');
const seedQuotes = require('./seedQuotes');
const seedPayments = require('./seedPayments');

/**
 * Run all seed scripts in the correct order
 */
async function seedAll() {
  console.log(colors.rainbow('\n╔════════════════════════════════════════╗'));
  console.log(colors.rainbow('║   IDURAR ERP/CRM - Database Seeding   ║'));
  console.log(colors.rainbow('╚════════════════════════════════════════╝\n'));

  const startTime = Date.now();

  try {
    // Step 1: Seed Clients (must be first as other entities depend on clients)
    console.log(colors.cyan('═'.repeat(50)));
    console.log(colors.cyan('STEP 1: Seeding Clients'));
    console.log(colors.cyan('═'.repeat(50)));
    await seedClients();

    // Step 2: Seed Invoices (depends on clients)
    console.log(colors.cyan('\n' + '═'.repeat(50)));
    console.log(colors.cyan('STEP 2: Seeding Invoices'));
    console.log(colors.cyan('═'.repeat(50)));
    await seedInvoices();

    // Step 3: Seed Quotes (depends on clients)
    console.log(colors.cyan('\n' + '═'.repeat(50)));
    console.log(colors.cyan('STEP 3: Seeding Quotes'));
    console.log(colors.cyan('═'.repeat(50)));
    await seedQuotes();

    // Step 4: Seed Payments (depends on invoices)
    console.log(colors.cyan('\n' + '═'.repeat(50)));
    console.log(colors.cyan('STEP 4: Seeding Payments'));
    console.log(colors.cyan('═'.repeat(50)));
    await seedPayments();

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(colors.rainbow('\n╔════════════════════════════════════════╗'));
    console.log(colors.rainbow('║          Seeding Complete! 🎉         ║'));
    console.log(colors.rainbow('╚════════════════════════════════════════╝\n'));

    console.log(colors.green(`✅ All seed scripts completed successfully!`));
    console.log(colors.gray(`⏱️  Total time: ${duration} seconds`));

    console.log(colors.yellow('\n📊 Summary:'));
    console.log(colors.white('  • Clients seeded'));
    console.log(colors.white('  • Invoices seeded'));
    console.log(colors.white('  • Quotes seeded'));
    console.log(colors.white('  • Payments seeded'));

    console.log(colors.cyan('\n🌐 You can now login to the frontend at:'));
    console.log(colors.white('   http://localhost:3000'));
    console.log(colors.cyan('\n🔐 Login credentials:'));
    console.log(colors.white(`   Email: ${process.env.ADMIN_EMAIL || 'admin@admin.com'}`));
    console.log(colors.white(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`));

    process.exit(0);
  } catch (error) {
    console.error(colors.red('\n╔════════════════════════════════════════╗'));
    console.error(colors.red('║       Seeding Failed! ❌              ║'));
    console.error(colors.red('╚════════════════════════════════════════╝\n'));

    console.error(colors.red('Error details:'));
    console.error(colors.red(error.message));

    if (error.stack) {
      console.error(colors.gray('\nStack trace:'));
      console.error(colors.gray(error.stack));
    }

    console.log(colors.yellow('\n💡 Troubleshooting tips:'));
    console.log(colors.white('  1. Make sure backend is running on http://localhost:8888'));
    console.log(colors.white('  2. Verify admin credentials in .env file'));
    console.log(colors.white('  3. Check that database setup was completed (npm run setup in backend)'));
    console.log(colors.white('  4. Ensure all dependencies are installed (npm install)'));

    process.exit(1);
  }
}

// Run the seeding process
seedAll();
