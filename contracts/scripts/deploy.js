require('dotenv').config();
const { ethers } = require('hardhat');

const WMON = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);

  const Relayer = await ethers.getContractFactory('MonPayRelayer');
  const relayer = await Relayer.deploy();
  await relayer.deployed();
  console.log('MonPayRelayer:', relayer.address);

  const Sub = await ethers.getContractFactory('MonPaySubscription');
  const sub = await Sub.deploy(WMON, relayer.address);
  await sub.deployed();
  console.log('MonPaySubscription:', sub.address);

  // set trusted forwarder on relayer side (no extra setup needed here)
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
