"use client"
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Shell, PageIntro, DemoBanner } from '../../components/site-shell'
import { useWallet } from '../../context/WalletContext'
import { isAddress, isHexString } from 'ethers'

export default function AdminPage() {
  const [walletToAssign, setWalletToAssign] = useState('')
  const [roleToAssign, setRoleToAssign] = useState('2')
  const [assignmentMessage, setAssignmentMessage] = useState('')
  const [walletToCheck, setWalletToCheck] = useState('')
  const [lookupMessage, setLookupMessage] = useState('')
  const [nameToAssign, setNameToAssign] = useState('')  
     const [nameToAssign1, setNameToAssign1] = useState('')  

    const [walletToCheck4, setWalletToCheck4] = useState('')
  const { contract } = useWallet()
  const [walletToCheck2, setWalletToCheck2] = useState('')
  const [certificateHashToRevoke, setCertificateHashToRevoke] = useState('')

  async function syncWalletName(address, name) {
    const response = await fetch('/api/certificates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, name }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || `Erreur API (${response.status}).`)
    return result.updatedCount
  }

  async function assignRole() {
    try {
      setLookupMessage("Waiting for confirmation...")
      const tx = await contract.grantRoleAndName(
        walletToAssign, roleToAssign, nameToAssign
      )
      await tx.wait()
      const updatedCount = await syncWalletName(walletToAssign, nameToAssign)
      setLookupMessage(`Rôle et nom mis à jour. ${updatedCount} certificat(s) synchronisé(s) avec la base.`)
    } catch (e) {
      setLookupMessage(e.reason || e.shortMessage || e.message);
    }
  }
const ROLE_LABELS = {
  0: "Aucun rôle",
  1: "Admin",
  2: "Émetteur",
  3: "Vérificateur",
};
  async function revokeCertificate() {
    const hash = certificateHashToRevoke.trim()

    if (!isHexString(hash, 32)) {
      setLookupMessage('Hash invalide. Vérifiez le format 0x... (32 octets).')
      return
    }

    try {
      setLookupMessage('Révocation en cours...')
      const tx = await contract.revokeCertificate(hash)
      await tx.wait()

      await fetch(`/api/certificates/${encodeURIComponent(hash)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revoked: true }),
      })

      setLookupMessage('Certificat révoqué et base de données mise à jour.')
    } catch (e) {
      setLookupMessage(e.reason || e.shortMessage || e.message)
    }
  }

  async function showUsersRoles() {
  const address = walletToCheck2.trim();

  if (!isAddress(address)) {
    setLookupMessage("Adresse invalide. Vérifiez le format 0x…");
    return;
  }

  try {
    setLookupMessage("Recherche en cours...");
    const result = await contract.roles(address);
    const roleId = Number(result);
    const label = ROLE_LABELS[roleId] ?? `Rôle inconnu (${roleId})`;

    setLookupMessage(
      roleId === 0
        ? `${label} : cette adresse n'a aucun rôle.`
        : `Rôle : ${label}`
    );
  } catch (e) {
    setLookupMessage(e.reason || e.shortMessage || e.message);
  }
}
  async function assignName () {
    const address = walletToCheck4.trim()
    const name = nameToAssign1.trim()
    if (!isAddress(address)) {
      setLookupMessage('Adresse invalide. Vérifiez le format 0x…')
      return
    }
    if (!name) {
      setLookupMessage('Saisissez le nom à attribuer.')
      return
    }

    try {
      setLookupMessage('Mise à jour en cours...')
      const tx = await contract.setName(address, name)
      await tx.wait()
      const updatedCount = await syncWalletName(address, name)
      setLookupMessage(`Nom mis à jour. ${updatedCount} certificat(s) synchronisé(s) avec la base.`)
    } catch (e) {
      setLookupMessage(e.reason || e.shortMessage || e.message)
    }
  }
  async function showUserName () {
  const address = walletToCheck.trim();

  if (!isAddress(address)) {
    setLookupMessage("Adresse invalide. Vérifiez le format 0x…");
    return;
  }

  try {
    setLookupMessage("Recherche en cours...");  
    const result = await contract.names(address);
    setLookupMessage(`Nom : ${result}`);
  } catch (e) {
    setLookupMessage(e.reason || e.shortMessage || e.message);
  }
}
  return (
    <Shell>
      <div className="page-container">
        <PageIntro
          kicker="ADMINISTRATION"
          title={
            <>
              Gérer les rôles,
              <br />
              <span>construire la confiance.</span> 
            </>
          }
        >
          Attribuez les permissions qui sécurisent le registre CertChain.
        </PageIntro>
        <section className="admin-grid">
          <article className="form-card">
            <div className="form-card-title">
              <UserPlus />
              <div>
                <h2>Attribuer un rôle</h2>
                <p>Donnez à une adresse les droits nécessaires.</p>
              </div>
            </div>
            <label>
              Adresse du portefeuille
                 <input
                    id="assign-wallet"
                    name="wallet"
                    value={walletToAssign}
                    onChange={(event) => setWalletToAssign(event.target.value)}
                    placeholder="0x…"
                    required
                    />
            </label>
            <label>
              Nom de l'utilisateur
                 <input
                    id="assign-name"
                    name="name"
                    value={nameToAssign}
                    onChange={(event) => setNameToAssign(event.target.value)}
                    placeholder="Nom de l'utilisateur"
                    required
                    />
            </label>
           <label htmlFor="assign-role">
                Rôle
                <select
                  id="assign-role"
                  name="role"
                  value={roleToAssign}
                  onChange={(event) => setRoleToAssign(event.target.value)}
                >
                  <option value="0">User</option>
                  <option value="1">Administrateur</option>
                  <option value="2">Émetteur</option>
                  <option value="3">Vérificateur</option>
                </select>
              </label>

            <button onClick={assignRole} className="secondary-button flex-end">Attribuer le rôle ↗</button>

          </article>
          <article className="form-card">
            <div className="form-card-title">
              <ShieldCheck />
              <div>
                <h2>Consulter une adresse</h2>
                <p>Vérifiez les permissions existantes.</p>
              </div>
            </div>
             <label htmlFor="lookup-wallet">
                Adresse du portefeuille
                <input
                  id="lookup-wallet"
                  name="wallet"
                  value={walletToCheck}
                  onChange={(event) => {
                    setWalletToCheck(event.target.value)
                    setLookupMessage('')
                  }}
                  placeholder="0x…"
                  required
                />
              </label>

            <button  onClick={showUsersRoles} className="secondary-button flex-end">Consulter les rôles</button>
          
            <div className="form-card-title">
              <ShieldCheck />
              <div>
                <h2>Consulter un Nom d'utilisateur</h2>
                <p>Vérifiez le nom d'utilisateur associé à une adresse.</p>
              </div>
            </div>
            
             <label htmlFor="lookup-wallet">
                Adresse du portefeuille
                <input
                  id="lookup-wallet"
                  name="wallet"
                  value={walletToCheck2}
                  onChange={(event) => {
                    setWalletToCheck2(event.target.value)
                    setLookupMessage('')
                  }}
                  placeholder="0x…"
                  required
                />
              </label>

            <button  onClick={showUserName} className="secondary-button ">Consulter le nom</button>


          </article>


            <article className="form-card">
            <div className="form-card-title">
              <ShieldCheck />
              <div>
                <h2>Revoke certificate</h2>
                <p>Révoquer un certificat.</p>
              </div>
            </div>
             <label htmlFor="revoke-hash">
                Hash du certificat
                <input
                  id="revoke-hash"
                  name="hash"
                  value={certificateHashToRevoke}
                  onChange={(event) => {
                    setCertificateHashToRevoke(event.target.value)
                    setLookupMessage('')
                  }}
                  placeholder="0x..."
                  required
                />
              </label>

            <button onClick={revokeCertificate} className="secondary-button flex-end">Révoquer le certificat</button>
          
           
          </article>

          

            <article className="form-card">
            <div className="form-card-title">
              <ShieldCheck />
              <div>
                <h2>Attribuer un nom</h2>
                <p>Attribuer un nom à une adresse de portefeuille.</p>
              </div>
            </div>
             <label htmlFor="lookup-wallet">
                Adresse du portefeuille
                <input
                  id="lookup-wallet"
                  name="wallet"
                  value={walletToCheck4}
                  onChange={(event) => {
                    setWalletToCheck4(event.target.value)
                    setLookupMessage('')
                  }}
                  placeholder="0x…"
                  required
                />
              </label>
             <label htmlFor="assign-name">
                Nom à attribuer
                <input
                  id="assign-name"
                  name="name"
                  value={nameToAssign1}
                  onChange={(event) => {
                    setNameToAssign1(event.target.value)
                    setLookupMessage('')
                  }}
                  placeholder="0x..."
                  required
                />
              </label>

            <button onClick={assignName} className="secondary-button flex-end">Attribuer le nom</button>
          
           
          </article>
        </section>

                    {lookupMessage && <p className="form-feedback" role="status">{lookupMessage}</p>}

      </div>
    </Shell>
  )
}