// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @dev Secure land registry with backend-controlled transfers
 */
contract LandRegistry {

    /* ============================
        ROLES & ACCESS CONTROL
    ============================ */

    address public admin;

    mapping(address => bool) public isLandOfficer;
    mapping(address => bool) public isSystem; // 🔥 Backend role

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOfficer() {
        require(
            isLandOfficer[msg.sender] || msg.sender == admin,
            "Only officer/admin"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            isLandOfficer[msg.sender] ||
            isSystem[msg.sender] ||
            msg.sender == admin,
            "Not authorized"
        );
        _;
    }

    /* ============================
        DATA STRUCTURES
    ============================ */

    struct LandParcel {
        uint256 id;
        string lrNumber;
        address owner;
        string ipfsDocHash;
        bool isVerified;
        uint256 createdAt;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
        string mpesaRef;
    }

    /* ============================
        STATE
    ============================ */

    uint256 public landCount;

    mapping(uint256 => LandParcel) public lands;
    mapping(uint256 => OwnershipRecord[]) public ownershipHistory;

    mapping(string => uint256) public lrToId;
    mapping(string => bool) public registeredLR;

    // 🔒 Prevent duplicate payment processing
    mapping(string => bool) public processedPayments;

    /* ============================
        EVENTS
    ============================ */

    event LandRegistered(
        uint256 indexed landId,
        string lrNumber,
        address owner,
        string ipfsHash
    );

    event OwnershipTransferred(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        string mpesaRef
    );

    event OfficerStatusChanged(address indexed officer, bool status);
    event SystemStatusChanged(address indexed system, bool status);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    /* ============================
        CONSTRUCTOR
    ============================ */

    constructor() {
        admin = msg.sender;
        isLandOfficer[msg.sender] = true;
    }

    /* ============================
        ADMIN CONTROLS
    ============================ */

    function setOfficerStatus(address _officer, bool _status) external onlyAdmin {
        require(_officer != address(0), "Invalid address");
        isLandOfficer[_officer] = _status;
        emit OfficerStatusChanged(_officer, _status);
    }

    function setSystemAddress(address _system, bool _status) external onlyAdmin {
        require(_system != address(0), "Invalid address");
        isSystem[_system] = _status;
        emit SystemStatusChanged(_system, _status);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");

        address oldAdmin = admin;
        admin = _newAdmin;

        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    /* ============================
        1. REGISTER LAND (MINT)
    ============================ */

    function registerLand(
        address _owner,
        string memory _lrNumber,
        string memory _ipfsHash
    ) external onlyOfficer returns (uint256) {

        require(!registeredLR[_lrNumber], "Land exists");
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
    ============================ */

    function transferOwnership(
        uint256 _landId,
        address _newOwner,
        string memory _mpesaRef
    ) external onlyAuthorized {

        LandParcel storage land = lands[_landId];

        require(land.id != 0, "Land not found");
        require(land.owner != address(0), "Invalid land state");
        require(_newOwner != address(0), "Invalid new owner");
        require(land.owner != _newOwner, "Same owner");

        // 🔒 Prevent double execution
        require(!processedPayments[_mpesaRef], "Payment already processed");
        processedPayments[_mpesaRef] = true;

        address previousOwner = land.owner;

        ownershipHistory[_landId].push(
            OwnershipRecord({
                from: previousOwner,
                to: _newOwner,
                timestamp: block.timestamp,
                mpesaRef: _mpesaRef
            })
        );

        land.owner = _newOwner;

        emit OwnershipTransferred(_landId, previousOwner, _newOwner, _mpesaRef);
    }

    /* ============================
        VIEW FUNCTIONS
    ============================ */

    function getLand(uint256 _id) external view returns (LandParcel memory) {
        require(lands[_id].id != 0, "Not found");
        return lands[_id];
    }

    function getLandByLR(string memory _lr) external view returns (LandParcel memory) {
        uint256 id = lrToId[_lr];
        require(id != 0, "LR not found");
        return lands[id];
    }

    function getOwnershipHistory(uint256 _id)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        return ownershipHistory[_id];
    }
}