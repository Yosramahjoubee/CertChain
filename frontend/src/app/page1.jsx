"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../lib/contract.js";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ student: "", degree: "", year: 2026, uri: "" });
    const [form2, setForm2] = useState({ student: "", hash: "" });

  const [list, setList] = useState([]);
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const set2 = (k) => (e) => setForm2({ ...form2, [k]: e.target.value });

  async function connect() {
    if (!window.ethereum) return setMsg("Install MetaMask first");
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAccount(await signer.getAddress());
    setContract(new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer));
  }

  async function create() {
    try {
      setMsg("Waiting for confirmation...");
      const tx = await contract.createCertificate(
        form.student, form.degree, Number(form.year), form.uri
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", tx.hash);
      console.log("Transaction receipt:", receipt);
      setMsg("Issued. Hash: " + receipt.logs[0].topics[1]);
    } catch (e) {
      setMsg(e.reason || e.shortMessage || e.message);
    }
  }
 async function issue() {
    try {
      setMsg("Waiting for confirmation...");
      const tx = await contract.issueCertificate(
         form2.hash,form2.student
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", tx.hash);
      console.log("Transaction receipt:", receipt);
      setMsg("Issued. Hash: " + receipt.logs[0].topics[1]);
    } catch (e) {
      setMsg(e.reason || e.shortMessage || e.message);
    }
  }
  async function loadMine() {
    try {
      var res = await contract.getCertificatesOf(account, false)
      console.log("Certificates of", account, ":", res);
      setList(res);
    } catch (e) { setMsg(e.shortMessage || e.message); }
  }

  async function verify() {
    try {
      const [valid, issuer, issuedAt] = await contract.verifyCertificate(hash);
      setResult({ valid, issuer, date: new Date(Number(issuedAt) * 1000).toLocaleDateString() });
    } catch (e) { setMsg(e.shortMessage || e.message); }
  }

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Diploma Certification</h1>
      {!account
        ? <button onClick={connect}>Connect MetaMask</button>
        : <p>Connected: {account}</p>}
      <p>{msg}</p>

      {contract && (
        <>
          <h2>Issue a certificate (issuers only)</h2>
          <input placeholder="Student address" value={form.student} onChange={set("student")} /><br />
          <input placeholder="Degree" value={form.degree} onChange={set("degree")} /><br />
          <input type="number" placeholder="Year" value={form.year} onChange={set("year")} /><br />
          <input placeholder="Metadata URI (IPFS)" value={form.uri} onChange={set("uri")} /><br />
          <button onClick={create}>Issue</button>


          <h2>Issue a certificate (issuers only)</h2>
          <input placeholder="0x... hash" value={form2.hash} onChange={set2("hash")} /><br />
          <input placeholder="Student address" value={form2.student} onChange={set2("student")} /><br />
          <button onClick={issue}>Issue</button>


          <h2>My valid certificates</h2>
          <button onClick={loadMine}>Load</button>
          {console.log(list)}
          <ul>
            {list.map((h) => <li key={h} style={{ wordBreak: "break-all" }}>{h}</li>)}
          </ul>

          <h2>Verify a certificate</h2>
          <input placeholder="0x... hash" value={hash} onChange={(e) => setHash(e.target.value)} />
          <button onClick={verify}>Verify</button>
          {result && (
            <p>
              {result.valid ? "Valid" : "Invalid or revoked"} | issuer: {result.issuer} | date: {result.date}
            </p>
          )}
        </>
      )}
    </main>
  );
}