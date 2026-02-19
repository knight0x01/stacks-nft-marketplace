import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    TransactionVersion
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { readFileSync } from 'fs';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error("Missing required environment variable");
}

const network = new StacksMainnet();
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
console.log(`Deploying from address: ${address}`);

async function getNextNonce(addr) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${addr}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function deployContract(contractName, filePath, nonce) {
    console.log(`Deploying ${contractName}...`);
    const contractContent = readFileSync(filePath, 'utf8');

    const txOptions = {
        contractName,
        codeBody: contractContent,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 20000n,
        nonce,
        postConditionMode: PostConditionMode.Allow,
        clarityVersion: 2,
    };

    const transaction = await makeContractDeploy(txOptions);
    const response = await broadcastTransaction(transaction, network);

    if (response.error) {
        console.error(`Failed:`, JSON.stringify(response, null, 2));
        return null;
    }
    console.log(`Success! TxID: ${response.txid}`);
    return response.txid;
}

async function main() {
    let nonce = await getNextNonce(address);

    console.log('\n🚀 Starting contract deployment to Stacks Mainnet...\n');
    console.log(`Deployer address: ${address}`);
    console.log(`Starting nonce: ${nonce}\n`);

    // Deploy 70 popular NFT collections
    await deployContract('cryptopunks', 'contracts/cryptopunks.clar', nonce++);
    await deployContract('bayc', 'contracts/bayc.clar', nonce++);
    await deployContract('mayc', 'contracts/mayc.clar', nonce++);
    await deployContract('azuki', 'contracts/azuki.clar', nonce++);
    await deployContract('clonex', 'contracts/clonex.clar', nonce++);
    await deployContract('moonbirds', 'contracts/moonbirds.clar', nonce++);
    await deployContract('doodles', 'contracts/doodles.clar', nonce++);
    await deployContract('pudgy-penguins', 'contracts/pudgy-penguins.clar', nonce++);
    await deployContract('cool-cats', 'contracts/cool-cats.clar', nonce++);
    await deployContract('wow', 'contracts/wow.clar', nonce++);
    await deployContract('meebits', 'contracts/meebits.clar', nonce++);
    await deployContract('milady', 'contracts/milady.clar', nonce++);
    await deployContract('invisible-friends', 'contracts/invisible-friends.clar', nonce++);
    await deployContract('cyberkongz', 'contracts/cyberkongz.clar', nonce++);
    await deployContract('art-blocks', 'contracts/art-blocks.clar', nonce++);
    await deployContract('degods', 'contracts/degods.clar', nonce++);
    await deployContract('y00ts', 'contracts/y00ts.clar', nonce++);
    await deployContract('otherdeed', 'contracts/otherdeed.clar', nonce++);
    await deployContract('sewer-pass', 'contracts/sewer-pass.clar', nonce++);
    await deployContract('checks', 'contracts/checks.clar', nonce++);
    await deployContract('opepen', 'contracts/opepen.clar', nonce++);
    await deployContract('nakamigos', 'contracts/nakamigos.clar', nonce++);
    await deployContract('captainz', 'contracts/captainz.clar', nonce++);
    await deployContract('potatoz', 'contracts/potatoz.clar', nonce++);
    await deployContract('beanz', 'contracts/beanz.clar', nonce++);
    await deployContract('renga', 'contracts/renga.clar', nonce++);
    await deployContract('sappy-seals', 'contracts/sappy-seals.clar', nonce++);
    await deployContract('deadfellaz', 'contracts/deadfellaz.clar', nonce++);
    await deployContract('creature-world', 'contracts/creature-world.clar', nonce++);
    await deployContract('mekaverse', 'contracts/mekaverse.clar', nonce++);
    await deployContract('hape-prime', 'contracts/hape-prime.clar', nonce++);
    await deployContract('prime-ape-planet', 'contracts/prime-ape-planet.clar', nonce++);
    await deployContract('gutter-cat-gang', 'contracts/gutter-cat-gang.clar', nonce++);
    await deployContract('phantabear', 'contracts/phantabear.clar', nonce++);
    await deployContract('karafuru', 'contracts/karafuru.clar', nonce++);
    await deployContract('murakami-flowers', 'contracts/murakami-flowers.clar', nonce++);
    await deployContract('valhalla', 'contracts/valhalla.clar', nonce++);
    await deployContract('digidaigaku', 'contracts/digidaigaku.clar', nonce++);
    await deployContract('moonrunners', 'contracts/moonrunners.clar', nonce++);
    await deployContract('goblintown', 'contracts/goblintown.clar', nonce++);
    await deployContract('nouns', 'contracts/nouns.clar', nonce++);
    await deployContract('cryptokitties', 'contracts/cryptokitties.clar', nonce++);
    await deployContract('bakc', 'contracts/bakc.clar', nonce++);
    await deployContract('veefriends', 'contracts/veefriends.clar', nonce++);
    await deployContract('nft-worlds', 'contracts/nft-worlds.clar', nonce++);
    await deployContract('fluf-world', 'contracts/fluf-world.clar', nonce++);
    await deployContract('rumble-kong-league', 'contracts/rumble-kong-league.clar', nonce++);
    await deployContract('cryptoadz', 'contracts/cryptoadz.clar', nonce++);
    await deployContract('on1-force', 'contracts/on1-force.clar', nonce++);
    await deployContract('parallel-alpha', 'contracts/parallel-alpha.clar', nonce++);
    await deployContract('tenktf', 'contracts/tenktf.clar', nonce++);
    await deployContract('adidas', 'contracts/adidas.clar', nonce++);
    await deployContract('mnlth', 'contracts/mnlth.clar', nonce++);
    await deployContract('rare-apepe', 'contracts/rare-apepe.clar', nonce++);
    await deployContract('gucci-grail', 'contracts/gucci-grail.clar', nonce++);
    await deployContract('koda', 'contracts/koda.clar', nonce++);
    await deployContract('chemistry-club', 'contracts/chemistry-club.clar', nonce++);
    await deployContract('hv-mtl', 'contracts/hv-mtl.clar', nonce++);
    await deployContract('lotm', 'contracts/lotm.clar', nonce++);
    await deployContract('pudgy-rods', 'contracts/pudgy-rods.clar', nonce++);
    await deployContract('lil-pudgys', 'contracts/lil-pudgys.clar', nonce++);
    await deployContract('my-pet-hooligan', 'contracts/my-pet-hooligan.clar', nonce++);
    await deployContract('pixelmon', 'contracts/pixelmon.clar', nonce++);
    await deployContract('kaijukingz', 'contracts/kaijukingz.clar', nonce++);
    await deployContract('boss-beauties', 'contracts/boss-beauties.clar', nonce++);
    await deployContract('supducks', 'contracts/supducks.clar', nonce++);
    await deployContract('toon-squad', 'contracts/toon-squad.clar', nonce++);
    await deployContract('lazy-lions', 'contracts/lazy-lions.clar', nonce++);
    await deployContract('cyberbrokers', 'contracts/cyberbrokers.clar', nonce++);
    await deployContract('wonderpals', 'contracts/wonderpals.clar', nonce++);

    // Deploy additional top 20 NFT collections
    await deployContract('autoglyphs', 'contracts/autoglyphs.clar', nonce++);
    await deployContract('loot', 'contracts/loot.clar', nonce++);
    await deployContract('mfers', 'contracts/mfers.clar', nonce++);
    await deployContract('forgotten-runes', 'contracts/forgotten-runes.clar', nonce++);
    await deployContract('chimpers', 'contracts/chimpers.clar', nonce++);
    await deployContract('tubby-cats', 'contracts/tubby-cats.clar', nonce++);
    await deployContract('terraforms', 'contracts/terraforms.clar', nonce++);
    await deployContract('sandbox-land', 'contracts/sandbox-land.clar', nonce++);
    await deployContract('decentraland', 'contracts/decentraland.clar', nonce++);
    await deployContract('blitmap', 'contracts/blitmap.clar', nonce++);
    await deployContract('hashmasks', 'contracts/hashmasks.clar', nonce++);
    await deployContract('wolf-game', 'contracts/wolf-game.clar', nonce++);
    await deployContract('chain-runners', 'contracts/chain-runners.clar', nonce++);
    await deployContract('animetas', 'contracts/animetas.clar', nonce++);
    await deployContract('tiny-dinos', 'contracts/tiny-dinos.clar', nonce++);
    await deployContract('eightliens', 'contracts/eightliens.clar', nonce++);
    await deployContract('jenkins-valet', 'contracts/jenkins-valet.clar', nonce++);
    await deployContract('dreadfulz', 'contracts/dreadfulz.clar', nonce++);
    await deployContract('quirkies', 'contracts/quirkies.clar', nonce++);
    await deployContract('illuminati', 'contracts/illuminati.clar', nonce++);

    console.log('\n✅ All 90 NFT collections deployed successfully!\n');
}

main().catch(console.error);
