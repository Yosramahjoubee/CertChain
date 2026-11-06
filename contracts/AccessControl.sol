// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

abstract contract AccessControl {
    enum Role { None, Admin, Issuer, Verifier }

    mapping(address => Role) public roles;
    mapping(address => string) public names;

    event RoleGranted(address indexed account, Role role);
    event RoleRevoked(address indexed account);
    event NameSet(address indexed account, string name);
    event RoleGrantedNamed(address indexed account, Role role, string name);

    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Not admin");
        _;
    }

    modifier onlyIssuer() {
        require(roles[msg.sender] == Role.Issuer, "Not issuer");
        _;
    }

    modifier onlyVerifier() {
        require(roles[msg.sender] == Role.Verifier, "Not verifier");
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Admin;
        emit RoleGranted(msg.sender, Role.Admin);
    }

    function grantRole(address account, Role role) external  onlyAdmin {
        require(account != address(0), "Zero address");
        require(role != Role.None, "Use revokeRole");
        roles[account] = role;
        emit RoleGranted(account, role);
    }
    function setName(address account, string memory name) external onlyAdmin {
        require(account != address(0), "Zero address");
        require(bytes(name).length > 0, "set a name ");
        names[account] = name;
        emit NameSet(account, name);
    }
    function grantRoleAndName(address account, Role role, string memory name) external onlyAdmin {
        require(account != address(0), "Zero address");
        require(role != Role.None, "Use revokeRole");
        require(bytes(name).length > 0, "set a name ");
        roles[account] = role;
        names[account] = name;
        emit RoleGrantedNamed(account, role, name);
    }
    function revokeRole(address account) external onlyAdmin {
        require(account != msg.sender, "Admin cannot revoke self");
        roles[account] = Role.None;
        emit RoleRevoked(account);
    }
    function getName(address account) external view returns (string memory) {
        return names[account];
    }
    function _requireNamed(address who, string memory errorMessage) internal view {
        require(bytes(names[who]).length > 0, errorMessage);
    }
}