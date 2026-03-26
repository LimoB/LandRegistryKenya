// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    address public land_officer;

    struct LandParcel {
        uint id;
        string lrNumber;      // Linked to lrNumber in Drizzle
        address owner;        // Wallet address from users table
        string ipfsDocHash;   // Document hash from lands table
        bool isVerified;
    }

    struct OwnershipHistory {
        address from;
        address to;
        uint timestamp;
        string mpesaRef;      // M-Pesa code stored for audit
    }

    mapping(uint => LandParcel) public lands;
    mapping(uint => OwnershipHistory[]) public history;
    mapping(string => bool) public registeredLRs;

    uint public landsCount;

    event LandRegistered(uint indexed landId, string lrNumber, address owner);
    event OwnershipTransferred(uint indexed landId, address from, address to);

    modifier onlyOfficer() {
        require(msg.sender == land_officer, "Only Land Officer can authorize");
        _;
    }

    constructor() {
        land_officer = msg.sender;
    }

    // Called when Land Officer verifies a new parcel
    function registerInitialLand(address _owner, string memory _lr, string memory _ipfs) public onlyOfficer {
        require(!registeredLRs[_lr], "LR Number already on-chain");
        
        landsCount++;
        lands[landsCount] = LandParcel(landsCount, _lr, _owner, _ipfs, true);
        registeredLRs[_lr] = true;

        emit LandRegistered(landsCount, _lr, _owner);
    }

    // Called when Land Officer approves a transfer (After M-Pesa verification)
    function transferOwnership(uint _landId, address _newOwner, string memory _mpesaRef) public onlyOfficer {
        LandParcel storage land = lands[_landId];
        address oldOwner = land.owner;

        history[_landId].push(OwnershipHistory(oldOwner, _newOwner, block.timestamp, _mpesaRef));
        land.owner = _newOwner;

        emit OwnershipTransferred(_landId, oldOwner, _newOwner);
    }
}