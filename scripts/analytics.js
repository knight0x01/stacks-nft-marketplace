import { getAddressFromPrivateKey } from '@stacks/transactions';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const address = getAddressFromPrivateKey(privateKey, 'mainnet');
const network = 'https://api.mainnet.hiro.so';

async function getMarketplaceAnalytics() {
    console.log('Fetching marketplace analytics...\n');

    try {
        // Get contract info
        const contractResponse = await fetch(
            `${network}/v2/contracts/interface/${address}/nft-marketplace`
        );
        const contractData = await contractResponse.json();

        console.log('Contract Status:', contractData.status || 'Deployed');

        // Get account info
        const accountResponse = await fetch(`${network}/v2/accounts/${address}?proof=0`);
        const accountData = await accountResponse.json();

        console.log('\nAccount Analytics:');
        console.log(`Balance: ${Number(accountData.balance) / 1000000} STX`);
        console.log(`Nonce: ${accountData.nonce}`);
        console.log(`Total Sent: ${Number(accountData.total_sent) / 1000000} STX`);
        console.log(`Total Received: ${Number(accountData.total_received) / 1000000} STX`);

        // Get recent transactions
        const txResponse = await fetch(
            `${network}/extended/v1/address/${address}/transactions?limit=10`
        );
        const txData = await txResponse.json();

        console.log(`\nRecent Transactions: ${txData.total}`);
        console.log(`Showing latest ${Math.min(10, txData.results.length)}:\n`);

        txData.results.slice(0, 5).forEach((tx, i) => {
            console.log(`${i + 1}. ${tx.tx_type} - ${tx.tx_status}`);
            console.log(`   TxID: ${tx.tx_id.substring(0, 20)}...`);
            console.log(`   Block: ${tx.block_height || 'Pending'}`);
        });

    } catch (error) {
        console.error('Error fetching analytics:', error.message);
    }
}

getMarketplaceAnalytics().catch(console.error);
