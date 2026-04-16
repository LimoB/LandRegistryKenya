// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {

    /* ============================
        ROLES
    ============================ */
    address public landOfficer;
    address public admin;

    modifier onlyOfficer() {
        require(msg.sender == landOfficer, "Only Land Officer allowed");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin allowed");
        _;
    }

    /* ============================
        DATA STRUCTURES
    ============================ */

    struct LandParcel {
        uint id;                  // matches DB onChainId
        string lrNumber;          // matches Drizzle lrNumber
        address owner;            // walletAddress from users table
        string ipfsDocHash;       // stored document hash
        bool isVerified;
        uint createdAt;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint timestamp;
        string mpesaRef;
    }

    /* ============================
        STATE
    ============================ */

    uint public landCount;

    mapping(uint => LandParcel) public lands;
    mapping(uint => OwnershipRecord[]) public ownershipHistory;
    mapping(string => uint) public lrToId; // fast lookup
    mapping(string => bool) public registeredLR;

    /* ============================
        EVENTS (IMPORTANT FOR BACKEND)
    ============================ */

    event LandRegistered(
        uint indexed landId,
        string lrNumber,
        address owner,
        string ipfsHash
    );

    event OwnershipTransferred(
        uint indexed landId,
        address indexed from,
        address indexed to,
        string mpesaRef
    );

    /* ============================
        CONSTRUCTOR
    ============================ */

    constructor() {
        admin = msg.sender;
        landOfficer = msg.sender;
    }

    /* ============================
        ADMIN CONTROLS
    ============================ */

    function setOfficer(address _officer) external onlyAdmin {
        require(_officer != address(0), "Invalid officer address");
        landOfficer = _officer;
    }

    /* ============================
        1. REGISTER LAND (MINT ON CHAIN)
        Called AFTER officer verification in backend
    ============================ */

    function registerInitialLand(
        address _owner,
        string memory _lrNumber,
        string memory _ipfsHash
    ) external onlyOfficer returns (uint) {

        require(!registeredLR[_lrNumber], "Land already exists on-chain");
        require(_owner != address(0), "Invalid owner");

        landCount++;

        lands[landCount] = LandParcel({
            id: landCount,
            lrNumber: _lrNumber,
            owner: _owner,
            ipfsDocHash: _ipfsHash,
            isVerified: true,
            createdAt: block.timestamp
        });

        registeredLR[_lrNumber] = true;
        lrToId[_lrNumber] = landCount;

        emit LandRegistered(landCount, _lrNumber, _owner, _ipfsHash);

        return landCount;
    }

    /* ============================
        2. TRANSFER OWNERSHIP
        Called AFTER M-Pesa + DB approval
    ============================ */

    function transferOwnership(
        uint _landId,
        address _newOwner,
        string memory _mpesaRef
    ) external onlyOfficer {

        LandParcel storage land = lands[_landId];

        require(land.id != 0, "Land does not exist");
        require(_newOwner != address(0), "Invalid new owner");

        address previousOwner = land.owner;

        // store history
        ownershipHistory[_landId].push(
            OwnershipRecord({
                from: previousOwner,
                to: _newOwner,
                timestamp: block.timestamp,
                mpesaRef: _mpesaRef
            })
        );

        // update ownership
        land.owner = _newOwner;

        emit OwnershipTransferred(_landId, previousOwner, _newOwner, _mpesaRef);
    }

    /* ============================
        3. VIEW FUNCTIONS (IMPORTANT FOR BACKEND)
    ============================ */

    function getLand(uint _id) external view returns (LandParcel memory) {
        return lands[_id];
    }

    function getLandByLR(string memory _lr) external view returns (LandParcel memory) {
        uint id = lrToId[_lr];
        return lands[id];
    }

    function getOwnershipHistory(uint _id)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        return ownershipHistory[_id];
    }
}