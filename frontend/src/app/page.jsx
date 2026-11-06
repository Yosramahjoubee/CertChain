'use client'
import {  useRouter  } from 'next/navigation'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Blocks,
  Check,
  FileCheck,
  Fingerprint,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react'
import { Shell } from '../components/site-shell.jsx'
const certificateHash = '0x9f2c4b7e1a8d3056c7e94f12b0a6d85e3c1f7a92d4e60b58a1c93e7f5b2d8c04'

function NetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId = 0
    const points = Array.from({ length: 46 }, (_, i) => ({
      x: (i * 83) % 1600,
      y: (i * 137) % 900,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
    }))

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.clearRect(0, 0, w, h)

      points.forEach((p) => {
        p.x += p.dx
        p.y += p.dy

        if (p.x < 0 || p.x > w) p.dx *= -1
        if (p.y < 0 || p.y > h) p.dy *= -1
      })

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i]
          const b = points[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)

          if (d < 170) {
            ctx.strokeStyle = `rgba(100,130,190,${(1 - d / 170) * 0.12})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      points.forEach((p) => {
        ctx.fillStyle = 'rgba(125,211,252,.28)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="network" aria-hidden="true" />
}

function StatCounter({ value, label }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function CertificateCard() {
  const cardRef = useRef(null)

  const onMove = (e) => {
    const el = cardRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    el.style.setProperty('--rx', `${y * -7}deg`)
    el.style.setProperty('--ry', `${x * 9}deg`)
  }

  const onLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--rx', '0deg')
      cardRef.current.style.setProperty('--ry', '0deg')
    }
  }

  return (
    <div className="visual-stage">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="satellite sat-a">
        <span className="sat-icon violet">
          <LockKeyhole size={14} />
        </span>
        <div>
          <b>Hash enregistré</b>
          <small>Block #18 204 331</small>
        </div>
      </div>
      <div className="satellite sat-b">
        <span className="sat-icon cyan">
          <Sparkles size={14} />
        </span>
        <div>
          <b>Stocké sur IPFS</b>
          <small>Réplique sécurisée</small>
        </div>
      </div>
      <div className="satellite sat-c">
        <span className="sat-icon green">
          <Check size={14} />
        </span>
        <div>
          <b>Émis par</b>
          <small>Esprit</small>
        </div>
      </div>
      <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave} className="certificate-card">
        <div className="scanline" />
        <div className="cert-top">
          <span className="cert-label">
            CERTIFICAT DIGITAL <em>·</em> 2026
          </span>
          <span className="cert-logo">
            <ShieldCheck size={15} /> CC
          </span>
        </div>
        <div className="cert-rule" />
        <div className="cert-body">
          <p className="eyebrow">CERTIFICATE OF ACHIEVEMENT</p>
          <h2>
            Master en
            <br />
            <span>Informatique</span>
          </h2>
          <p className="cert-school">Esprit</p>
          <div className="cert-meta">
            <div>
              <small>ÉTUDIANT</small>
              <strong>Alaa belhassen</strong>
            </div>
            <div>
              <small>ANNÉE</small>
              <strong>2026</strong>
            </div>
          </div>
        </div>
        <div className="cert-footer">
          <div className="hash">
            <small>DOCUMENT HASH</small>
            <code>
              {certificateHash.slice(0, 21)}...{certificateHash.slice(-8)}
            </code>
          </div>
          <div className="verified-stamp">
            <Check size={15} strokeWidth={3} />
            <span>VÉRIFIÉ</span>
          </div>
        </div>
        <div className="soulbound">
          <LockKeyhole size={11} /> NFT NON TRANSFÉRABLE
        </div>
      </div>
    </div>
  )
}

function VerifyBox() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')
   // redirige vers la page du certificat
  const router = useRouter()

  const verify = () => {
   router.push(`/verifier`)   
    setStatus('loading')
    setTimeout(() => {
      setStatus(value.toLowerCase().includes('9f2c') ? 'valid' : 'invalid')
    }, 800)
  }

  return (
    <div className="verify-box" id="verify">
      <div className="verify-heading">
        <span className="verify-icon">
          <ShieldCheck size={17} />
        </span>
        <div>
          <strong>Vérification instantanée</strong>
          <small>La preuve, sans intermédiaire.</small>
        </div>
      </div>
      <div className="verify-form">
        <label htmlFor="hash">Hash du diplôme</label>
        <div className="input-row">
          <input
            id="hash"
            aria-label="Hash du diplôme"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setStatus('idle')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                verify()
              }
            }}
            placeholder="0x…"
          />
          <button onClick={verify} disabled={status === 'loading'}>
            {status === 'loading' ? 'Analyse…' : 'Vérifier'} <ArrowUpRight size={15} />
          </button>
        </div>
        {status === 'valid' && (
          <p className="result valid" role="status">
            <Check size={14} /> Diplôme valide · preuve confirmée sur le réseau
          </p>
        )}
        {status === 'invalid' && (
          <p className="result invalid" role="status">
            <X size={14} /> Introuvable ou révoqué · vérifiez le hash
          </p>
        )}
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const steps = [
    ['01', 'Émission', 'L’établissement renseigne le diplôme et l’adresse du diplômé.', FileCheck],
    ['02', 'Empreinte', 'Un hash unique est calculé pour représenter le document.', Fingerprint],
    ['03', 'Enregistrement', 'La preuve est inscrite sur la blockchain et devient infalsifiable.', Blocks],
    ['04', 'Portefeuille', 'Le diplômé reçoit un certificat NFT non transférable.', WalletCards],
    ['05', 'Vérification', 'Un recruteur vérifie le diplôme sans compte ni intermédiaire.', SearchCheck],
  ]

  return (
    <section id="how" className="how-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">COMMENT ÇA MARCHE</span>
          <h2>
            La confiance, de l’émission
            <br />
            <span>à la vérification.</span>
          </h2>
          <p>Une infrastructure simple pour rendre chaque diplôme portable, permanent et vérifiable.</p>
        </div>
      </div>
      <div className="how-grid">
        {steps.map(([number, title, text, Icon]) => (
          <article className="how-card" key={number}>
            <span className="how-icon">
              <Icon size={21} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function InstitutionsSection() {
  // Ajout du numéro manquant : le .map attendait 3 valeurs par ligne
  const features = [
    ['01', 'Émettre en quelques clics', 'Créez des certificats signés par votre établissement et délivrez-les directement aux diplômés.'],
    ['02', 'Révoquer en temps réel', 'Gardez le contrôle sur chaque preuve : une révocation est visible immédiatement par les recruteurs.'],
    ['03', 'Vérifier sans compte', 'Partagez un lien ou un QR code. Toute personne peut vérifier un diplôme, sans inscription.'],
  ]

  return (
    <section id="institutions" className="institutions-section">
      <div className="institution-intro">
        <div>
          <span className="section-kicker">POUR LES ÉTABLISSEMENTS</span>
          <h2>
            Votre signature académique,
            <br />
            <span>en confiance.</span>
          </h2>
          <p>
            Modernisez la délivrance des diplômes et réduisez les fraudes avec une infrastructure conçue pour les
            universités, écoles et organismes de formation.
          </p>
          <a
            className="institution-cta"
            href="mailto:partenaires@certchain.fr?subject=Demande%20d'accès%20établissement"
          >
            Demander un accès établissement <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="institution-grid">
        {features.map(([number, title, description]) => (
          <article className="institution-card" key={number}>
            <span className="institution-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="card-arrow">
              <ArrowUpRight size={15} />
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Page() {
    const router = useRouter()

  return (
    <Shell>
    <main id="top" className="site">
      <NetworkBackground />
      <div className="hero-wrap">
        <section className="hero-copy">
          <div className="live-badge">
            <i /> Vérifiable on-chain
          </div>
          <h1>
            Des diplômes que personne ne peut <span>falsifier.</span>
          </h1>
          <p className="hero-sub">
            Émettez, possédez et vérifiez vos certificats sur la blockchain.
            <br className="desktop" /> Une preuve infalsifiable, vérifiable en quelques secondes.
          </p>
          <div className="hero-buttons">
            <a className="primary-button" href="#verify">
              je suis un étudiant <ArrowUpRight size={17} />
            </a>
            <a  className="secondary-button" href="#institutions">
              Je suis un établissement <ArrowUpRight size={16} />
            </a>
          </div>
          <VerifyBox />
          <div className="stats">
            <StatCounter value="100 %" label="infalsifiable" ff/>
            <StatCounter value="< 3 s" label="de vérification" />
            <StatCounter value="0" label="intermédiaire" />
          </div>
        </section>
        <section className="hero-art" aria-label="Aperçu d'un certificat vérifié">
          <div className="art-kicker">
            <span /> CERTIFICATE / 001 <span className="art-line" />
          </div>
          <CertificateCard />
          <div className="art-caption">
            <span className="caption-line" />
            <span>Une preuve qui vous appartient.</span>
            <span className="caption-dot" />
          </div>
        </section>
      </div>
      <HowItWorksSection />
      <InstitutionsSection />
    
    </main>
        </Shell>

  )
}
