// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IjazahStorage {
    address public owner;
    uint256 public totalCertificates;
    string public network = "Sepolia Testnet";

    struct IjazahData {
        bytes32 hash;
        string nim;
        string nama;
        string nomorIjazah;
        uint256 tahunLulus;
        uint256 timestamp;
        bool isRevoked;
        bool exists;
        address issuedBy;
    }

    mapping(bytes32 => IjazahData) public certificates;
    mapping(address => bool) public authorizedAdmins;

    event CertificateStored(
        bytes32 indexed hash,
        string nim,
        string nama,
        uint256 timestamp,
        address indexed issuedBy
    );

    event CertificateVerified(
        bytes32 indexed hash,
        bool isValid,
        address indexed verifier
    );

    event CertificateRevoked(
        bytes32 indexed hash,
        address indexed revokedBy,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang bisa");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || authorizedAdmins[msg.sender], "Hanya admin yang bisa");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAdmins[msg.sender] = true;
    }

    function addAdmin(address _admin) public onlyOwner {
        authorizedAdmins[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyOwner {
        authorizedAdmins[_admin] = false;
    }

    function storeCertificate(
        bytes32 _hash,
        string memory _nim,
        string memory _nama,
        string memory _nomorIjazah,
        uint256 _tahunLulus
    ) public onlyAdmin {
        require(!certificates[_hash].exists, "Sertifikat sudah ada");

        certificates[_hash] = IjazahData({
            hash: _hash,
            nim: _nim,
            nama: _nama,
            nomorIjazah: _nomorIjazah,
            tahunLulus: _tahunLulus,
            timestamp: block.timestamp,
            isRevoked: false,
            exists: true,
            issuedBy: msg.sender
        });

        totalCertificates++;

        emit CertificateStored(_hash, _nim, _nama, block.timestamp, msg.sender);
    }

    function verifyCertificate(bytes32 _hash)
        public
        view
        returns (
            bool isValid,
            string memory nim,
            string memory nama,
            string memory nomorIjazah,
            uint256 tahunLulus,
            uint256 timestamp,
            bool isRevoked,
            address issuedBy
        )
    {
        IjazahData memory data = certificates[_hash];

        if (!data.exists) {
            return (false, "", "", "", 0, 0, false, address(0));
        }

        return (
            true,
            data.nim,
            data.nama,
            data.nomorIjazah,
            data.tahunLulus,
            data.timestamp,
            data.isRevoked,
            data.issuedBy
        );
    }

    function revokeCertificate(bytes32 _hash) public onlyAdmin {
        require(certificates[_hash].exists, "Sertifikat tidak ditemukan");
        require(!certificates[_hash].isRevoked, "Sudah dicabut");

        certificates[_hash].isRevoked = true;

        emit CertificateRevoked(_hash, msg.sender, block.timestamp);
    }

    function isCertificateRevoked(bytes32 _hash) public view returns (bool) {
        return certificates[_hash].isRevoked;
    }

    function getTotalCertificates() public view returns (uint256) {
        return totalCertificates;
    }

    function getNetworkInfo() public view returns (string memory) {
        return network;
    }
}
