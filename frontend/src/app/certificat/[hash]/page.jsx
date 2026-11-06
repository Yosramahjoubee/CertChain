import { Check, ExternalLink, LockKeyhole } from 'lucide-react'
import { Shell, PageIntro, CopyButton } from '../../../components/site-shell'
import { getCertificate } from '../../../lib/db'

export default async function CertificatePage({ params }) {
  const { hash } = await params
  const certificate = await getCertificate(hash)


  if (!certificate) {
    return (
      <Shell>
        <div className="page-container">
          <PageIntro
            kicker="CERTIFICAT"
            title={
              <>
                Introuvable
                <br />
                <span>dans le registre.</span>
              </>
            }
          >
            Ce certificat n’existe pas ou n’a pas encore été enregistré.
          </PageIntro>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="page-container">
        <PageIntro
          kicker="CERTIFICAT PARTAGEABLE"
          title={
            <>
              Une preuve qui
              <br />
              <span>vous appartient.</span>
            </>
          }
        >
          Ce certificat est consultable publiquement et vérifiable directement sur le réseau.
        </PageIntro>


        <section className="certificate-detail">
         {certificate.revoked? (
            <div className="detail-statusRevoked">
              <span className="Revoked-icon p-2  text-red-800">
                <LockKeyhole size={18} /> 
              </span>
              <div>
                <strong>REVOQUÉ</strong>
                <span>Certificat non valide</span>
              </div>
            </div>
          ): (  <div className="detail-status">
            <span className="verified-icon p-2">
              <Check size={18} />
            </span>
            <div>
              <strong>VÉRIFIÉ</strong>
              <span>Certificat authentique et actif</span>
            </div>
          </div>)}
        
     
          <div className="detail-content">
            <span className="section-kicker">CERTIFICATE OF ACHIEVEMENT</span>
            <h2>{certificate.title}</h2>
            <p className="detail-school">{certificate.issuerName}</p>
            <div className="detail-grid">
              <div>
                <small>ÉTUDIANT HASH</small>
                <strong>{certificate.studentName}</strong>
              </div>
              <div>
                <small>ANNÉE</small>
                <strong>{certificate.year}</strong>
              </div>
              <div>
                <small>DATE D&apos;ÉMISSION</small>
                <strong>{new Date(certificate.createdAt).toLocaleDateString('fr-FR')}</strong>
              </div>
            </div>
          </div>

          <div className="hash-box">
            <small>DOCUMENT HASH</small>
            <code>{certificate.hash}</code>
            <CopyButton value={certificate.hash} />
          </div>
        </section>

        <section className="proof-grid">
          <article className="data-card">
            <span className="section-kicker">PREUVE ON-CHAIN</span>
            <h3>Enregistré sur la blockchain</h3>
            <p>
              Le hash du document est ancré de manière permanente. Le fichier original reste hors chaîne,
              stocké sur IPFS.
            </p>
            <a className="text-link" href="#proof">
              Voir sur l&apos;explorateur <ExternalLink size={14} />
            </a>
          </article>

          <article className="data-card">
            <LockKeyhole size={19} />
            <h3>NFT non transférable</h3>
            <p>Ce certificat est lié à l&apos;adresse du diplômé et ne peut pas être vendu ou transmis.</p>
          </article>
        </section>
      </div>
    </Shell>
  )
}
