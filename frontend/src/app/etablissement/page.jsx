"use client"

import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Shell, PageIntro, DemoBanner, CertificateCard, Stat } from '../../components/site-shell'
import { useWallet } from '../../context/WalletContext'
import { useEffect, useState } from 'react'

const demoCertificates = [
  {
    hash: '0x9f2c4b7e1a8d3056c7e94f12b0a6d85e3c1f7a92d4e60b58a1c93e7f5b2d8c04',
    title: 'Master en Informatique',
    school: 'Université de Sousse',
    year: '2026',
    status: 'Valide',
  },
  {
    hash: '0x41a7d1ec9be9c5f3a8e3dbe4c7d0b9e10d4987d842ab1203d4a1cbf6f62ef17',
    title: 'Licence en Finance',
    school: 'Institut Supérieur de Gestion',
    year: '2025',
    status: 'Valide',
  },
  {
    hash: '0x7dd604a9c736bdb5d21bbb20991a7d98cf34d5ca860d9e2a7d846dbbec7c1ad9',
    title: 'Certificat de Design UX',
    school: 'École de Design de Tunis',
    year: '2024',
    status: 'Révoqué',
  },
]

export default function InstitutionPage() {
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
  
      loadMine()
    }, [account])
  
  const validCount = list.filter((certificate) => certificate.status === 'Valide').length
  const revokedCount = list.filter((certificate) => certificate.status === 'Révoqué').length
    return (
    <Shell>
      <div className="page-container">
        <PageIntro
          kicker="ESPACE ÉTABLISSEMENT"
          title={
            <>
              Votre registre
              <br />
              <span>de confiance.</span>
            </>
          }
        >
          Pilotez les certificats émis par votre établissement depuis un espace unique.
        </PageIntro>


        <div className="dashboard-header">
          <div className="stats dashboard-stats">
            <Stat value={list.length} label="émis" />
            <Stat value={validCount} label="valides" />
            <Stat value={revokedCount} label="révoqués" />
          </div>

          <Link className="primary-button" href="/etablissement/emettre">
            <Plus size={16} /> Émettre un certificat
          </Link>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-kicker">REGISTRE</span>
            <h2>Certificats émis</h2>
          </div>
          <div className="search-control">
            <Search size={15} />
            <input placeholder="Rechercher une adresse" />
          </div>
        </div>

        <div className="certificate-list">
          {list.map((certificate) => (
            <CertificateCard key={certificate.hash} certificate={certificate} />
          ))}
        </div>
      </div>
    </Shell>
  )
}
