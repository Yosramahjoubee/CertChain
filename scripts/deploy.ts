import { network } from "hardhat";

const { ethers } = await network.connect("localhost");

const [admin, university,verifier] = await ethers.getSigners();
// deploy CertificateRegistry
const registry = await ethers.deployContract("CertificateRegistry");
await registry.waitForDeployment();
// deploy nft certificate

const nft = await ethers.deployContract("CertificateNFT", [await registry.getAddress()]);
await nft.waitForDeployment();

await (await registry.setNFT(await nft.getAddress())).wait();
await (await registry.grantRole(university.address, 2)).wait(); // 2 = Issuer
await (await registry.grantRole(verifier.address, 3)).wait(); // 3 = Verifier

console.log("Registry:", await registry.getAddress());
console.log("NFT:", await nft.getAddress());
console.log("Admin:", admin.address);
console.log("Issuer (university):", university.address);
console.log("Verifier:", verifier.address);