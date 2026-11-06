'use client'

import { useEffect, useState } from 'react'
import { FileUp, ShieldCheck } from 'lucide-react'
import { Shell, PageIntro, CertificateCard } from '../../components/site-shell'
import { useWallet } from '../../context/WalletContext'

export default function VerifierPage() {
      const { contract } = useWallet()

  const [hash, setHash] = useState('')
  const [state, setState] = useState('idle')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

 async function handleVerify() {
    try {
      const tx = await contract.verifyCertificate(hash);
      console.log("Transaction hash:", tx);
      setState(tx[0] ? 'valid' : 'invalid');
      setMsg(tx[0] ? `Certificat valide : ${tx[0]}` : 'Aucun certificat trouvé pour ce hash.');
    } catch (e) { setMsg(e.shortMessage || e.message); }
  }

    async function loadMine() {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(`/api/certificates`)
            if (!response.ok) {
            throw new Error('Impossible de récupérer vos certificats.')
            }

            const data = await response.json()
            const formatted = (Array.isArray(data) ? data : []).map((certificate) => ({
            ...certificate,
            status: certificate.revoked ? 'Révoqué' : 'Valide',
            school: certificate.school || 'Université',
            year: String(certificate.year ?? '2026'),
            hash: certificate.hash,
            }))

            setList(formatted)
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des certificats.')
            setList([])
        } finally {
            setLoading(false)
        }
        }
    useEffect(() => {
        setList([])
   
      

        loadMine()
  }, []);
  return (
    <Shell>
      <div className="page-container">
        <PageIntro
          kicker="VÉRIFIER UN DIPLÔME"
          title={
            <>
              La confiance se vérifie
              <br />
              <span>en quelques secondes.</span>
            </>
          }
        >
          Collez un hash on-chain ou déposez votre document. Le fichier reste dans votre navigateur et
          n&apos;est jamais envoyé.
        </PageIntro>


        <section className="verify-panel">
          <div className="verify-panel-heading">
            <ShieldCheck size={22} />
            <div>
              <h2>Preuve numérique</h2>
              <p>Format attendu : 0x suivi de 64 caractères hexadécimaux.</p>
            </div>
          </div>

          <input
            className="large-input"
            value={hash}
            onChange={(event) => {
              setHash(event.target.value)
              setState('idle')
            }}  
            placeholder="0x9f2c4b7e1a8d..."
          />

          <div className="verify-panel-actions">
            <button type="button" className="primary-button" onClick={handleVerify}>
              Vérifier le hash ↗
            </button>
            <span>ou</span>
            <button type="button" className="secondary-button">
              <FileUp size={16} /> Déposer un PDF
            </button>
          </div>

          {state === 'valid' && (
            <div className="verification-result valid-result">
              <b>VÉRIFIÉ ✓</b>
              <span>{hash}</span>
            </div>
          )}

            {state !== 'valid'  && msg && (
            <div className="verification-result error-result">
              <b>Erreur</b>
              <span>{msg}</span>
            </div>
          )}
            



        </section>

        <section className="recent-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">EXEMPLES</span>
              <h2>Certificats consultables</h2>
            </div>
          </div>

          <div className="certificate-list">
            {list.map((certificate) => (
              <CertificateCard key={certificate.hash} certificate={certificate} />
            ))}
          </div>
        </section>
      </div>
    </Shell>
  )
}
