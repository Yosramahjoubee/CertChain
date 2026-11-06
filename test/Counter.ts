import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("CertChain", function () {
  async function deployContracts() {
    const [admin, issuer, student] = await ethers.getSigners();
    const registry = await ethers.deployContract("CertificateRegistry");
    const nft = await ethers.deployContract("CertificateNFT", [
      await registry.getAddress(),
    ]);
    await registry.setNFT(await nft.getAddress());
    await registry.grantRole(issuer.address, 2);
    await registry.grantRoleAndName(issuer.address, 2, "Test University");
    await registry.registerInstitution(issuer.address, "Test University", 0);
    return { admin, issuer, student, registry, nft };
  }

  it("registers an issuer and creates a certificate program", async function () {
    const { issuer, registry } = await deployContracts();

    await expect(registry.connect(issuer).createProgram("Computer Science"))
      .to.emit(registry, "ProgramCreated");

    expect(await registry.roles(issuer.address)).to.equal(2n);
  });

  it("minted diplomas cannot be transferred", async function () {
    const { student, registry, nft } = await deployContracts();
    const studentCIN = ethers.keccak256(ethers.toUtf8Bytes("student-1"));
    await registry.registerStudent(studentCIN, student.address);

    const [, issuer] = await ethers.getSigners();
    await registry.connect(issuer).createProgram("Computer Science");
    await registry.connect(issuer).enrollStudents(1, [studentCIN]);
    await registry.setName(student.address, "Student One");

    await registry.connect(issuer).createCertificate(1, studentCIN);
    const createdEvents = await registry.queryFilter(registry.filters.CertificateCreated());
    const hash = createdEvents.at(-1)?.args.hash;
    if (!hash) throw new Error("Certificate hash was not emitted");
    await registry.connect(issuer).issueCertificate(hash, student.address);

    const recipient = (await ethers.getSigners())[3];
    await expect(nft.connect(student).transferFrom(student.address, recipient.address, hash))
      .to.be.revertedWith("Soulbound: non-transferable");
  });
});
