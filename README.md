# LandRegistryKenya

A blockchain-based land registry system designed to digitize land ownership, verification, and transfer processes in Kenya. The platform leverages Ethereum and IPFS to provide a transparent and tamper-proof system, while PostgreSQL handles scalable off-chain business logic.

---

## Overview

LandRegistryKenya introduces a hybrid architecture that combines blockchain immutability with efficient off-chain storage. It ensures secure land registration, verifiable ownership history, and streamlined transfer processes while maintaining performance and cost efficiency.

---

## Key Features

### Land Management

* **Digital Registration**
  Register land parcels with title deed documents stored on IPFS.

* **Verification System**
  Government land officers can verify and approve ownership records through an administrative dashboard.

* **Secure Metadata Storage**
  Land details are stored in PostgreSQL using Drizzle ORM for structured and scalable data management.

---

### Blockchain Integration

* **Immutable Registration**
  Each land registration is recorded as a transaction on the Ethereum blockchain.

* **Ownership History Tracking**
  Complete ownership history is permanently stored and verifiable on-chain.

* **Hybrid Data Architecture**
  Heavy data such as documents and metadata are stored off-chain (IPFS and PostgreSQL), while hashes and ownership references are stored on-chain to reduce gas costs.

---

### Event-Driven Synchronization

* **Smart Contract Event Listeners**
  The backend listens for events such as `LandRegistered` and `OwnershipTransferred`.

* **Automatic Data Synchronization**
  PostgreSQL is automatically updated whenever blockchain events are triggered, ensuring consistency between systems.

---

### Security and Authentication

* **Role-Based Access Control (RBAC)**
  Defined roles include:

  * Citizen
  * Land Officer
  * Admin

* **Authentication**
  JWT-based authentication with password hashing using Bcrypt.

* **Email Verification**
  Mandatory email verification for account activation.

* **Payment Integration**
  M-Pesa integration via Daraja API for handling land-related transactions.

---

## Technology Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Backend    | Node.js, Express.js, TypeScript        |
| Blockchain | Solidity (^0.8.20), Ganache, Ethers.js |
| Database   | PostgreSQL, Drizzle ORM                |
| Storage    | IPFS (Pinata or Local Gateway)         |
| Payments   | M-Pesa Daraja API                      |
| DevOps     | Linux Environment, Truffle             |

---

## Project Structure

```
LandRegistryKenya/
├── Backend/                     # Express.js and TypeScript source code
│   ├── src/
│   │   ├── blockchain/         # Blockchain providers, listeners, and logic
│   │   ├── auth/               # Authentication and authorization
│   │   ├── lands/              # Land management routes and services
│   │   ├── drizzle/            # Database schema and migrations
│   │   └── middleware/         # RBAC and security middleware
│
├── contracts/                  # Solidity smart contracts
├── migrations/                 # Truffle deployment scripts
└── .env                        # Environment configuration
```

---

## Installation and Setup

### 1. Clone the Repository

```
git clone https://github.com/LimoB/LandRegistryKenya.git
cd LandRegistryKenya/Backend
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```
# Database
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
```

---

### 3. Deploy and Run the Application

Start Ganache, then deploy the smart contracts:

```
truffle migrate --network ganache
```

Start the backend server:

```
npm run dev
```

---

## System Architecture

```
Frontend --> Backend API --> PostgreSQL
                   |
                   --> Ethereum Blockchain
                           |
                           --> Event Listener --> PostgreSQL
```

---

## Design Philosophy

### Scalability

The system minimizes blockchain usage by storing only essential references on-chain while handling large datasets off-chain.

### Data Integrity

All ownership transactions are recorded on an immutable blockchain ledger, eliminating the risk of fraudulent modifications.

### Cost Efficiency

By offloading heavy data to IPFS and PostgreSQL, the system reduces gas fees associated with blockchain transactions.

### Local Adaptation

Integration with M-Pesa allows users to perform transactions using local currency, improving accessibility and usability.

---

## Author

Boaz Limo
Software Engineer | Full-Stack Developer | Blockchain Enthusiast

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.