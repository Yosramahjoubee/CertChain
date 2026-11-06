# CertChain

CertChain is a decentralized application for issuing, owning, and verifying academic diplomas. A university issues a certificate, the student receives a soulbound ERC-721 certificate, and recruiters can verify authenticity without an account.

## Features

- Role-based access for administrators, issuers, and verifiers
- University and program registration
- Student enrollment and certificate creation
- Non-transferable diploma NFTs
- Certificate revocation and verification
- Next.js web interface and Hardhat smart contracts

## Tech stack

- Solidity and Hardhat 3
- ethers.js and Mocha
- OpenZeppelin ERC-721
- Next.js frontend

## Project structure

```text
contracts/       Smart contracts
frontend/        Next.js application
test/            Integration tests
scripts/         Deployment scripts
ignition/        Ignition deployment modules
```

## Smart contracts

- `AccessControl.sol` — role and institution administration
- `CertificateRegistry.sol` — institutions, programs, students, certificates, and verification
- `CertificateNFT.sol` — soulbound diploma NFT

## Setup

Install dependencies:

```shell
npm install
```

Compile the contracts and run the tests:

```shell
npm run build
npm run test
```

## Run locally

Start a local blockchain in one terminal:

```shell
npx hardhat node
```

Deploy the contracts in another terminal:

```shell
npm run deploy:localhost
```

The deployment script prints the registry and NFT contract addresses. Configure the frontend with those addresses before using the web application.

## Frontend

```shell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Sepolia deployment

Configure the following environment variables:

```text
SEPOLIA_RPC_URL=<your Sepolia RPC URL>
SEPOLIA_PRIVATE_KEY=<your funded deployment private key>
```

Deploy with:

```shell
npm run deploy:sepolia
```

Never commit a private key or seed phrase.

## License

MIT
