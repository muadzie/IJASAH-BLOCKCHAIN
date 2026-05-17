const path = require('path');
const ethers = require(path.join(__dirname, '..', '..', 'frontend', 'node_modules', 'ethers'));

const [,, action] = process.argv;

async function main() {
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', async () => {
    try {
      const params = JSON.parse(input);

      const provider = new ethers.JsonRpcProvider(params.rpcUrl);
      const wallet = new ethers.Wallet(params.privateKey, provider);

      const iface = new ethers.Interface(params.abi);
      const data = iface.encodeFunctionData(params.functionName, params.functionArgs);

      const gasPrice = await provider.getFeeData();
      const nonce = await provider.getTransactionCount(wallet.address);

      const tx = await wallet.sendTransaction({
        to: params.contractAddress,
        data,
        gasLimit: params.gasLimit || 3000000,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
        nonce,
        chainId: params.chainId || 11155111,
      });

      const receipt = await tx.wait();

      const result = {
        success: true,
        tx_hash: tx.hash,
        block_number: receipt.blockNumber.toString(),
        block_hash: receipt.blockHash,
        gas_used: receipt.gasUsed.toString(),
        from: tx.from,
      };

      process.stdout.write(JSON.stringify(result));
    } catch (err) {
      process.stdout.write(JSON.stringify({
        success: false,
        error: err.message || String(err),
      }));
    }
  });
}

main();
