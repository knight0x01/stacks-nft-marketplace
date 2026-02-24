import { fetchWithRetry } from './network.js';

export async function getTxStatus(txid, network = 'mainnet') {
  const baseUrl = network === 'testnet' 
    ? 'https://api.testnet.hiro.so' 
    : 'https://api.mainnet.hiro.so';
  
  try {
    const data = await fetchWithRetry(`${baseUrl}/extended/v1/tx/${txid}`);
    return {
      txid,
      status: data.tx_status,
      type: data.tx_type,
      result: data.tx_result,
      blockHeight: data.block_height,
    };
  } catch (error) {
    return { txid, status: 'not_found', error: error.message };
  }
}

export async function waitForTx(txid, network = 'mainnet', maxAttempts = 30, delayMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getTxStatus(txid, network);
    
    if (status.status === 'success') return status;
    if (status.status === 'abort_by_response' || status.status === 'abort_by_post_condition') {
      throw new Error(`Transaction failed: ${status.result}`);
    }
    
    await new Promise(r => setTimeout(r, delayMs));
  }
  
  throw new Error(`Transaction timeout: ${txid}`);
}
