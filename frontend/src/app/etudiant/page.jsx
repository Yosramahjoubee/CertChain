"use client"

import { useEffect, useState } from 'react'
import { Shell, PageIntro, DemoBanner, CertificateCard, Stat } from '../../components/site-shell'
import { useWallet } from '../../context/WalletContext'

export default function StudentPage() {
  const { account } = useWallet()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!account) {
      setList([])
      return
    }

    async function loadMine() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/certificates?student=${encodeURIComponent(account)}`)
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

    loadMine()
  }, [account])

  const validCount = list.filter((certificate) => certificate.status === 'Valide').length
  const revokedCount = list.filter((certificate) => certificate.status === 'Révoqué').length
  const latestYear = list.length ? Math.max(...list.map((certificate) => Number(certificate.year || 0))) : 0

  return (
    <Shell>
      <div className="page-container">
        <PageIntro
          kicker="MON PORTEFEUILLE"
          title={
            <>
              Mes diplômes,
              <br />
              <span>toujours avec moi.</span>
            </>
          }
        >
          Retrouvez vos certificats et partagez une preuve vérifiable en un clic.
        </PageIntro>


        <div className="stats dashboard-stats">
          <Stat value={String(validCount)} label="certificats valides" />
          <Stat value={String(revokedCount)} label="révoqué" />
          <Stat value={latestYear || 2026} label="dernière émission" />
        </div>

        <div className="section-heading">
          <div>
            <span className="section-kicker">MES CERTIFICATS</span>
            <h2>Votre collection</h2>
          </div>
          <div className="filter-pills">
            <button type="button" className="active">
              Valides
            </button>
            <button type="button">Tous</button>
          </div>
        </div>

        {loading && <p className="form-feedback">Chargement de vos certificats…</p>}
        {error && <p className="result invalid" role="alert">{error}</p>}

        {!loading && !error && list.length === 0 && (
          <p className="form-feedback">Aucun certificat trouvé pour cette adresse.</p>
        )}

        <div className="certificate-list">
          {list.map((certificate) => (
            <CertificateCard key={certificate.hash} certificate={certificate} />
          ))}
        </div>
      </div>
    </Shell>
  )
}
