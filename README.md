🇰🇪 LandRegistryKenya

A blockchain-powered land registry system that digitizes land ownership, verification, and transfer processes using Ethereum (Ganache), Express.js, PostgreSQL (Drizzle ORM), and IPFS storage.

The system ensures transparent, tamper-proof land records, while keeping heavy business logic off-chain for scalability and low gas costs.

🚀 Key Features
🏡 Land Management
Register land parcels with title deed upload (IPFS)
Verify land ownership by government officers
Store land metadata in PostgreSQL
⛓️ Blockchain Integration
Land minting on Ethereum smart contract
Ownership transfer recorded on-chain
Immutable ownership history
🔄 Event-Driven Sync
Listens to smart contract events:
LandRegistered
OwnershipTransferred
Automatically syncs blockchain → PostgreSQL
Zero manual database updates required
👤 Authentication System
Role-based access:
citizen
land_officer
admin
JWT authentication middleware
Email verification system
💳 Off-chain Payments
M-Pesa / Stripe handled off-chain (no gas costs)
Verification tokens handled in backend only
📦 File Storage
IPFS integration for land documents
Stores only hashes on-chain
🏗️ Tech Stack
Backend
Node.js
Express.js
TypeScript
Database
PostgreSQL
Drizzle ORM
Blockchain
Solidity ^0.8.20
Ganache / Ethereum local network
Ethers.js
Storage
IPFS (Pinata or local gateway)
Authentication & Security
JWT
bcrypt
Role-based middleware
📁 Project Structure
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
⚙️ Installation
1. Clone repository
git clone https://github.com/your-username/LandRegistryKenya.git
cd LandRegistryKenya
2. Install dependencies
cd Backend
npm install
3. Setup environment variables

Create .env file:

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

or use Ganache GUI:

Port: 7545
5. Deploy Smart Contract (Truffle)
truffle compile
truffle migrate --network ganache
6. Start backend server
npm run dev
⛓️ Smart Contract Overview
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
Events (Used for DB Sync)
event LandRegistered(uint landId, string lrNumber, address owner, string ipfsHash);

event OwnershipTransferred(uint landId, address from, address to, string mpesaRef);
🔄 Blockchain ↔ Database Sync

The system automatically syncs blockchain events into PostgreSQL:

Example flow:
Officer verifies land in backend
Backend calls smart contract
Blockchain emits event
Listener captures event
PostgreSQL updated automatically
🧠 Architecture Design
Frontend → Backend API → PostgreSQL
                     ↓
              Ethereum Blockchain
                     ↓
           Event Listener (Sync Layer)
                     ↓
             Auto DB Updates
💡 Design Decisions
✔ Why off-chain logic?
Lower gas fees
Faster processing
Easier scaling
✔ Why blockchain?
Immutable ownership records
Fraud prevention
Transparent land history
✔ Why event-driven sync?
Ensures consistency
Removes manual DB updates
Real-time blockchain reflection
🔐 Security
JWT authentication
Role-based access control
Wallet-based ownership verification
Email verification required before login
Private keys stored in .env
🧪 Future Improvements
 Add Graph indexer (The Graph Protocol)
 Multi-signature land officer approval
 Full audit dashboard
 IPFS decentralized pinning cluster
 Production blockchain (Polygon / Ethereum mainnet)
 Event replay system (for missed blocks)
📜 License

MIT License © 2026

👨‍💻 Author

Built as a Blockchain Land Registry System for Kenya
Designed for secure, transparent, and tamper-proof land management.