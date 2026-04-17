LandRegistryKenya

A blockchain-based land registry system that digitizes land ownership, verification, and transfer processes using Ethereum (Ganache), Express.js, PostgreSQL (Drizzle ORM), and IPFS storage.

The system provides a transparent and tamper-proof land record system while keeping heavy business logic off-chain to ensure scalability and reduced gas costs.

Key Features
Land Management
Register land parcels with title deed upload via IPFS
Government officers can verify land ownership
Land metadata stored securely in PostgreSQL
Decentralized storage of documents using IPFS hashes
Blockchain Integration
Land registration (minting) executed via Ethereum smart contracts
Ownership transfers recorded immutably on-chain
Complete ownership history preserved on blockchain
Event-Driven Synchronization
Listens to smart contract events:
LandRegistered
OwnershipTransferred
Automatically synchronizes blockchain data to PostgreSQL
Eliminates manual database updates
Authentication System
Role-based access control:
citizen
land_officer
admin
JWT-based authentication middleware
Email verification before account activation
Off-chain Payments
M-Pesa and Stripe integration handled off-chain
No gas fees for payment processing
Verification and transaction references stored in backend
File Storage
IPFS integration for land-related documents
Only IPFS hashes stored on-chain for efficiency
Tech Stack
Backend
Node.js
Express.js
TypeScript
Database
PostgreSQL
Drizzle ORM
Blockchain
Solidity ^0.8.20
Ethereum (Ganache / Local network)
Ethers.js
Storage
IPFS (Pinata or local gateway)
Authentication & Security
JWT authentication
bcrypt password hashing
Role-based authorization middleware
Project Structure
LandRegistryKenya/
│
├── Backend/
│   ├── src/
│   │   ├── blockchain/
│   │   │   ├── listener.ts
│   │   │   ├── provider.ts
│   │   │   ├── landActions.ts
│   │   │   └── artifacts/
│   │   │
│   │   ├── auth/
│   │   ├── lands/
│   │   ├── transfers/
│   │   ├── users/
│   │   ├── drizzle/
│   │   ├── middleware/
│   │   ├── emails/
│   │   └── app.ts
│   │
│   ├── server.ts
│   └── .env
│
├── contracts/
│   └── LandRegistry.sol
│
├── migrations/
│   └── 2_deploy_land.js
│
└── README.md
Installation
1. Clone Repository
git clone https://github.com/LimoB/LandRegistryKenya.git
cd LandRegistryKenya
2. Install Dependencies
cd Backend
npm install
3. Environment Variables

Create a .env file:

DATABASE_URL=postgresql://user:password@localhost:5432/landdb
PORT=4000

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
LAND_REGISTRY_ADDRESS=your_contract_address
OFFICER_PRIVATE_KEY=your_private_key

# Email
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend
CLIENT_URL=http://localhost:5173
4. Run Ganache
ganache

Or use Ganache GUI:

Port: 7545
5. Deploy Smart Contract
truffle compile
truffle migrate --network ganache
6. Start Backend Server
npm run dev
Smart Contract Overview
Land Registration
function registerInitialLand(
    address owner,
    string lrNumber,
    string ipfsHash
)
Ownership Transfer
function transferOwnership(
    uint landId,
    address newOwner,
    string mpesaRef
)
Events
event LandRegistered(
    uint landId,
    string lrNumber,
    address owner,
    string ipfsHash
);

event OwnershipTransferred(
    uint landId,
    address from,
    address to,
    string mpesaRef
);
Blockchain ↔ Database Synchronization

The system automatically synchronizes blockchain events with PostgreSQL.

Flow:
Officer verifies land in backend
Backend calls smart contract
Blockchain emits event
Listener captures event
PostgreSQL is updated automatically
System Architecture
Frontend → Backend API → PostgreSQL
                     ↓
              Ethereum Blockchain
                     ↓
           Event Listener (Sync Layer)
                     ↓
             Automated Database Updates
Design Decisions
Off-chain Logic
Reduces gas costs
Improves system performance
Enables scalability
Blockchain Usage
Immutable land ownership records
Fraud prevention
Transparent transaction history
Event-driven Architecture
Ensures real-time consistency
Eliminates manual synchronization
Improves reliability
Security
JWT authentication
Role-based access control
Wallet-based ownership verification
Email verification required before login
Private keys stored securely in environment variables
Future Improvements
Integration with The Graph Protocol
Multi-signature approval for land officers
Admin analytics dashboard
Decentralized IPFS pinning cluster
Production deployment on Polygon or Ethereum mainnet
Event replay system for missed blockchain events
License

MIT License © 2026

Author

Boaz Limo (LimoB)
Blockchain Land Registry System for Kenya

Designed to ensure secure, transparent, and tamper-proof land management through blockchain technology.