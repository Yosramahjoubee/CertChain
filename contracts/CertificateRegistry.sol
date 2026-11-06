// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

interface ICertificateNFT {
    function mint(address to, uint256 tokenId) external;
    function burn(uint256 tokenId) external;
}

contract CertificateRegistry is AccessControl {
    uint8 public constant EDUCATION = 0;
    uint8 public constant COMPANY = 1;

    struct Institution {
        string name;
        uint8 institutionType;
        bool exists;
    }

    struct Program {
        address issuer;
        string name;
        bool exists;
    }

    struct Certificate {
        address issuer;
        address student;
        bytes32 cinHash;
        uint256 programId;
        string degree;        
        uint16 year;        
        string metadataURI;  
        uint256 issuedAt;
        bool issued;
        bool revoked;
    }

    uint256 private nonce;
    uint256 private nextProgramId = 1;
    mapping(bytes32 => address) public walletOfCin;
    mapping(address => bytes32) public cinOfWallet;
    mapping(address => Institution) public institutions;
    mapping(uint256 => Program) private programs;
    mapping(address => uint256[]) private institutionPrograms;
    mapping(uint256 => mapping(bytes32 => bool)) public enrolled;
    mapping(uint256 => bytes32[]) private programStudents;
    mapping(address => mapping(bytes32 => bool)) private institutionStudent;
    mapping(address => bytes32[]) private institutionStudents;
    mapping(address => bytes32[]) private studentCertificates;
    mapping(bytes32 => bytes32[]) private cinCertificates;
    mapping(bytes32 => Certificate) private certificates;
    ICertificateNFT public nft; // optional

    event StudentRegistered(bytes32 indexed cinHash, address indexed wallet);
    event InstitutionRegistered(address indexed institution, string name, uint8 institutionType);
    event ProgramCreated(uint256 indexed programId, address indexed issuer, string name);
    event StudentsEnrolled(uint256 indexed programId, bytes32[] cinHashes);
    event CertificateIssued(bytes32 indexed hash, address indexed issuer, address indexed student);
    event CertificateRevoked(bytes32 indexed hash, address indexed by);
    event CertificateVerified(bytes32 indexed hash, address indexed verifier, bool valid);
    event CertificateCreated(bytes32 indexed hash, address indexed creator, uint256 indexed programId, bytes32 cinHash);

    function setNFT(address nftAddress) external onlyAdmin {
        nft = ICertificateNFT(nftAddress);
    }

    function registerStudent(bytes32 cinHash, address wallet) external onlyAdmin {
        require(cinHash != bytes32(0), "Empty CIN hash");
        require(wallet != address(0), "Zero address");
        require(walletOfCin[cinHash] == address(0), "CIN already registered");
        require(cinOfWallet[wallet] == bytes32(0), "Wallet already registered");

        walletOfCin[cinHash] = wallet;
        cinOfWallet[wallet] = cinHash;
        emit StudentRegistered(cinHash, wallet);
    }

    function registerInstitution(address institution, string calldata name, uint8 institutionType) external onlyAdmin {
        require(institution != address(0), "Zero address");
        require(roles[institution] == Role.Issuer, "Institution must be issuer");
        require(institutionType <= COMPANY, "Invalid institution type");
        require(bytes(name).length > 0, "Empty institution name");

        institutions[institution] = Institution(name, institutionType, true);
        names[institution] = name;
        emit InstitutionRegistered(institution, name, institutionType);
    }

    function createProgram(string calldata name) external onlyIssuer returns (uint256 programId) {
        require(institutions[msg.sender].exists, "Institution not registered");
        require(bytes(name).length > 0, "Empty program name");

        programId = nextProgramId++;
        programs[programId] = Program(msg.sender, name, true);
        institutionPrograms[msg.sender].push(programId);
        emit ProgramCreated(programId, msg.sender, name);
    }

    function programsOf(address issuer) external view returns (uint256[] memory) {
        return institutionPrograms[issuer];
    }

    function getProgram(uint256 programId) external view returns (address issuer, string memory name, bool exists) {
        Program memory program = programs[programId];
        return (program.issuer, program.name, program.exists);
    }

    function enrollStudents(uint256 programId, bytes32[] calldata cinHashes) external {
        Program memory program = programs[programId];
        require(program.exists, "Program does not exist");
        require(program.issuer == msg.sender, "Not program owner");

        for (uint256 i = 0; i < cinHashes.length; i++) {
            bytes32 cinHash = cinHashes[i];
            require(walletOfCin[cinHash] != address(0), "Student not registered");
            if (!enrolled[programId][cinHash]) {
                enrolled[programId][cinHash] = true;
                programStudents[programId].push(cinHash);
                if (!institutionStudent[msg.sender][cinHash]) {
                    institutionStudent[msg.sender][cinHash] = true;
                    institutionStudents[msg.sender].push(cinHash);
                }
            }
        }

        emit StudentsEnrolled(programId, cinHashes);
    }

    function getStudentsOfProgram(uint256 programId) external view returns (bytes32[] memory) {
        return programStudents[programId];
    }

    function studentsOf(address issuer) external view returns (bytes32[] memory) {
        return institutionStudents[issuer];
    }

    function createCertificate(uint256 programId, bytes32 cinHash) external onlyIssuer returns (bytes32 hash) {
        Program memory program = programs[programId];
        address student = walletOfCin[cinHash];
        require(program.exists, "Program does not exist");
        require(program.issuer == msg.sender, "Not program owner");
        require(student != address(0), "Student not registered");
        require(enrolled[programId][cinHash], "Student not enrolled");
        _requireNamed(msg.sender, "Issuer has no name");
        _requireNamed(student, "Student has no name");

        nonce++;
        hash = keccak256(abi.encode(programId, cinHash, msg.sender, block.timestamp, nonce));
        certificates[hash] = Certificate(
            msg.sender,
            student,
            cinHash,
            programId,
            program.name,
            uint16(1970 + block.timestamp / 365 days),
            "",
            block.timestamp,
            false,
            false
        );
        emit CertificateCreated(hash, msg.sender, programId, cinHash);
    }

    function issueCertificate(bytes32 hash, address student) external onlyIssuer {
        require(hash != bytes32(0), "Empty hash");
        require(certificates[hash].issuedAt > 0, "Certificate does not exist");
        require(!certificates[hash].issued, "Certificate already issued");
        require(certificates[hash].student == student, "Student mismatch");
        require(certificates[hash].issuer == msg.sender, "Issuer mismatch");
        certificates[hash].issued = true;
        studentCertificates[student].push(hash);
        cinCertificates[certificates[hash].cinHash].push(hash);
       
        if (address(nft) != address(0)) {
            nft.mint(student, uint256(hash));
        }

        emit CertificateIssued(hash, msg.sender, student);
    }
    function getCertificatesOf(address student, bool revoked) external view returns (bytes32[] memory) {
        bytes32[] storage all = studentCertificates[student];

        // Pass 1: count the matches
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (certificates[all[i]].revoked == revoked) {
                count++;
            }
        }
        // Pass 2: fill the result array
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (certificates[all[i]].revoked == revoked) {
                result[index] = all[i];
                index++;
            }
        }
        return result;
    }

    function getCertificatesByCin(bytes32 cinHash) external view returns (bytes32[] memory) {
        return cinCertificates[cinHash];
    }

    function getCertificate(bytes32 hash) external view returns (Certificate memory) {
        return certificates[hash];
    }
    // Revoke: only the issuer who issued it, or the admin
    function revokeCertificate(bytes32 hash) external {
        Certificate storage c = certificates[hash];
        require(c.issuedAt != 0, "Not found");
        require(!c.revoked, "Already revoked");
        require(
            msg.sender == c.issuer || roles[msg.sender] == Role.Admin,
            "Not allowed"
        );

        c.revoked = true;

        if (address(nft) != address(0)) {
            nft.burn(uint256(hash));
        }
        emit CertificateRevoked(hash, msg.sender);
    }

    // Free and public: anyone can check
    function verifyCertificate(bytes32 hash)
        public
        view
        returns (bool valid, address issuer, uint256 issuedAt)
    {
        Certificate memory c = certificates[hash];
        return (c.issued && !c.revoked, c.issuer, c.issuedAt);
    }

    // Optional: gives the Verifier role a purpose by leaving an on-chain trace
    function logVerification(bytes32 hash) external onlyVerifier {
        (bool valid, , ) = verifyCertificate(hash);
        emit CertificateVerified(hash, msg.sender, valid);
    }
}