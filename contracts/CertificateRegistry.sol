// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public owner;
    uint256 public certificateCount;

    enum Status { None, Issued, Revoked }

    struct Certificate {
        bytes32 hash;
        string studentName;
        string studentNim;
        string diplomaNumber;
        uint256 issuedAt;
        Status status;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => bool) public hashExists;

    event CertificateIssued(
        bytes32 indexed hash,
        string studentName,
        string studentNim,
        string diplomaNumber,
        uint256 timestamp
    );

    event CertificateRevoked(
        bytes32 indexed hash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        bytes32 _hash,
        string memory _studentName,
        string memory _studentNim,
        string memory _diplomaNumber
    ) external onlyOwner {
        require(!hashExists[_hash], "Certificate hash already exists");

        certificates[_hash] = Certificate({
            hash: _hash,
            studentName: _studentName,
            studentNim: _studentNim,
            diplomaNumber: _diplomaNumber,
            issuedAt: block.timestamp,
            status: Status.Issued
        });

        hashExists[_hash] = true;
        certificateCount++;

        emit CertificateIssued(_hash, _studentName, _studentNim, _diplomaNumber, block.timestamp);
    }

    function verifyCertificate(bytes32 _hash)
        external
        view
        returns (
            bool isValid,
            string memory studentName,
            string memory studentNim,
            string memory diplomaNumber,
            uint256 issuedAt,
            bool isRevoked
        )
    {
        Certificate memory cert = certificates[_hash];

        if (cert.status == Status.None) {
            return (false, "", "", "", 0, false);
        }

        return (
            cert.status == Status.Issued,
            cert.studentName,
            cert.studentNim,
            cert.diplomaNumber,
            cert.issuedAt,
            cert.status == Status.Revoked
        );
    }

    function revokeCertificate(bytes32 _hash) external onlyOwner {
        require(hashExists[_hash], "Certificate does not exist");
        require(certificates[_hash].status == Status.Issued, "Certificate not issued");

        certificates[_hash].status = Status.Revoked;

        emit CertificateRevoked(_hash, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
