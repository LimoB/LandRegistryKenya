// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @dev Manages land registration and ownership transfers on the blockchain.
 */
contract LandRegistry {

    /* ============================
        ROLES & ACCESS CONTROL
    ============================ */
    address public admin;
    mapping(address => bool) public isLandOfficer;

    modifier onlyOfficer() {
        require(
            isLandOfficer[msg.sender] || msg.sender == admin, 
            "Access denied: Only Land Officer or Admin allowed"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access denied: Only Admin allowed");
        _;
    }

    /* ============================
        DATA STRUCTURES
    ============================ */

    struct LandParcel {
        uint id;                  
        string lrNumber;          
        address owner;            
        string ipfsDocHash;       
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
    mapping(string => uint) public lrToId; 
    mapping(string => bool) public registeredLR;

    /* ============================
        EVENTS
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

    event OfficerStatusChanged(address indexed officer, bool status);

    /* ============================
        CONSTRUCTOR
    ============================ */

    constructor() {
        admin = msg.sender;
        // The deployer is an officer by default
        isLandOfficer[msg.sender] = true;
    }

    /* ============================
        ADMIN CONTROLS
    ============================ */

    /**
     * @dev Allows admin to add or remove officers.
     * This fixes the "Access Denied" issue by letting you authorize new wallets.
     */
    function setOfficerStatus(address _officer, bool _status) external onlyAdmin {
        require(_officer != address(0), "Invalid address");
        isLandOfficer[_officer] = _status;
        emit OfficerStatusChanged(_officer, _status);
    }

    /**
     * @dev Transfer admin rights to a new address.
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }

    /* ============================
        1. REGISTER LAND (MINT)
    ============================ */

    function registerLand(
        address _owner,
        string memory _lrNumber,
        string memory _ipfsHash
    ) external onlyOfficer returns (uint) {

        require(!registeredLR[_lrNumber], "Land already exists on blockchain");
        require(_owner != address(0), "Invalid owner address");

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
        uint _landId,
        address _newOwner,
        string memory _mpesaRef
    ) external onlyOfficer {

        LandParcel storage land = lands[_landId];

        require(land.id != 0, "Land record not found");
        require(_newOwner != address(0), "Invalid new owner address");
        require(land.owner != _newOwner, "New owner is the same as current owner");

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
        3. VIEW FUNCTIONS
    ============================ */

    function getLand(uint _id) external view returns (LandParcel memory) {
        require(lands[_id].id != 0, "Record does not exist");
        return lands[_id];
    }

    function getLandByLR(string memory _lr) external view returns (LandParcel memory) {
        uint id = lrToId[_lr];
        require(id != 0, "LR Number not found");
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