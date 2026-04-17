📜 LandRegistryKenyaA professional, blockchain-based land registry system designed to digitize land ownership, verification, and transfer processes in Kenya. By leveraging Ethereum and IPFS, the system ensures a transparent, tamper-proof record while utilizing PostgreSQL for scalable off-chain business logic.🚀 Key Features🏘️ Land ManagementDigital Registration: Register parcels with title deed uploads directly to IPFS.Verification: Government officers can verify and validate ownership within the dashboard.Secure Metadata: Comprehensive land details stored in PostgreSQL via Drizzle ORM.⛓️ Blockchain IntegrationImmutable Minting: Land registration is executed as a transaction on the Ethereum network.On-Chain History: Complete, verifiable ownership history preserved immutably.Hybrid Architecture: Keeps heavy data off-chain (IPFS/PostgreSQL) to minimize gas costs while keeping the "Source of Truth" on-chain.🔄 Event-Driven SynchronizationSmart Listeners: Real-time listeners for LandRegistered and OwnershipTransferred events.Auto-Sync: Automatically updates the PostgreSQL database when blockchain events occur, ensuring consistency without manual intervention.🔐 Security & AuthRBAC (Role-Based Access Control): Specific permissions for Citizen, Land_Officer, and Admin.M-Pesa Integration: Secure off-chain payment processing for land transfers and fees.Identity: JWT-based authentication with Bcrypt hashing and mandatory email verification.🛠️ Tech StackLayerTechnologyBackendNode.js, Express.js, TypeScriptBlockchainSolidity (^0.8.20), Ganache, Ethers.jsDatabasePostgreSQL, Drizzle ORMStorageIPFS (Pinata / Local Gateway)PaymentsM-Pesa Daraja APIDevOpsLinux/Kali environment, Truffle📂 Project StructurePlaintextLandRegistryKenya/
├── Backend/                # Express.js & TypeScript Source
│   ├── src/
│   │   ├── blockchain/     # Listeners, Providers, & Land Logic
│   │   ├── auth/           # JWT & Authentication Logic
│   │   ├── lands/          # Land Management Routes
│   │   ├── drizzle/        # Schema & Database Migrations
│   │   └── middleware/     # RBAC & Security
├── contracts/              # Solidity Smart Contracts
├── migrations/             # Truffle Deployment Scripts
└── .env                    # Configuration (Example below)
⚙️ Installation & Setup1. Clone & InstallBashgit clone https://github.com/LimoB/LandRegistryKenya.git
cd LandRegistryKenya/Backend
npm install
2. Configure EnvironmentCreate a .env file in the Backend directory:Code snippet# Database
DATABASE_URL=postgresql://user:password@localhost:5432/landdb
PORT=4000

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
LAND_REGISTRY_ADDRESS=0xYourContractAddress
OFFICER_PRIVATE_KEY=your_private_key

# Services
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CLIENT_URL=http://localhost:5173
3. Deploy & RunFire up Ganache.Deploy the contract:Bashtruffle migrate --network ganache
Start the development server:Bashnpm run dev
🏗️ System ArchitectureCode snippetgraph LR
    A[Frontend] --> B[Backend API]
    B --> C[(PostgreSQL)]
    B --> D[Ethereum Blockchain]
    D -- Emits Events --> E[Event Listener]
    E -- Updates --> C
🛡️ Design PhilosophyScalability: Heavy metadata is stored in PostgreSQL; only hashes and ownership IDs touch the blockchain.Fraud Prevention: By recording every transfer on an immutable ledger, unauthorized title changes become impossible.User Experience: Integration with M-Pesa allows users to pay in local currency while the system handles the cryptographic proof of transfer.👨‍💻 AuthorBoaz Limo (LimoB) Software Engineer | Full-Stack Developer | Blockchain Enthusiast📄 LicenseDistributed under the MIT License. See LICENSE for more information.