'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Menu, ShieldCheck, Wallet, X } from 'lucide-react'
import Navbar from './ui/navbar.jsx'
export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav-shell">
      <nav className="nav" aria-label="Navigation principale">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <ShieldCheck size={19} />
          </span>
          <span>
            Cert<span>Chain</span>
          </span>
        </Link>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          <Link href="/">Accueil</Link>
          <Link href="/fonctionnement">Fonctionnement</Link>
          <Link href="/verifier">Vérifier</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div className="nav-actions">
          <span className="network-pill">
            <i /> Réseau local
          </span>
          <button className="wallet-button" type="button">
            <Wallet size={16} /> Connecter le portefeuille
          </button>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer-note">
      <span>
        <strong>CertChain Protocol</strong>
        <b>·</b> La nouvelle couche de confiance académique
      </span>
      <span>
        © 2026 CertChain <b>·</b> Données vérifiables on-chain
      </span>
    </footer>
  )
}

export function Shell({ children }) {
  return (
    <main className="site">
      <Navbar />
      {children}
      <Footer />
    </main>
  )
}

export function PageIntro({ kicker, title, children }) {
  return (
    <section className="page-intro">
      <span className="section-kicker">{kicker}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </section>
  )
}

export function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      className="icon-button"
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
      aria-label="Copier"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  )
}

export function DemoBanner() {
  return (
    <div className="demo-banner">
      <span className="demo-dot" /> Mode démonstration{' '}
      <span>Les données affichées sont fictives en attendant la connexion au contrat.</span>
    </div>
  )
}

export function CertificateCard({ certificate }) {
  return (
    <article className="data-card certificate-row">
      <div className="certificate-row-main">
        <span className={`status-dot ${certificate?.status === 'Valide' ? 'success' : 'danger'}`} />
        <div>
          <strong>{certificate?.title}</strong>
          <span>
            {certificate?.school} · {certificate?.year}
          </span>
        </div>
      </div>
      <code>
        {certificate?.hash.slice(0, 10)}…{certificate?.hash.slice(-6)}
      </code>
      <span className={`status-label ${certificate?.status === 'Valide' ? 'success-text' : 'danger-text'}`}>
        {certificate?.status}
      </span>
      <Link className="text-link" href={`/certificat/${certificate?.hash}`}>
        Voir
      </Link>
    </article>
  )
}

export function Stat({ value, label }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export function SectionCard({ number, title, text }) {
  return (
    <article className="institution-card">
      <span className="institution-number">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

export const Arrow = ({ children }) => <span className="arrow-link">{children} ↗</span>

export function VerifyForm() {
  const [value, setValue] = useState('')
  const [result, setResult] = useState('idle')

  return (
    <div className="verify-box">
      <div className="verify-heading">
        <span className="verify-icon">
          <ShieldCheck size={17} />
        </span>
        <div>
          <strong>Vérification instantanée</strong>
          <small>La preuve, sans intermédiaire.</small>
        </div>
      </div>
      <label htmlFor="verify-hash">Hash du diplôme</label>
      <div className="input-row">
        <input
          id="verify-hash"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setResult('idle')
          }}
          placeholder="0x…"
        />
        <button type="button" onClick={() => setResult(value.includes('9f2c') ? 'valid' : 'invalid')}>
          Vérifier ↗
        </button>
      </div>
      {result === 'valid' && <p className="result valid">✓ Diplôme valide · preuve confirmée sur le réseau</p>}
      {result === 'invalid' && <p className="result invalid">× Introuvable ou révoqué · vérifiez le hash</p>}
    </div>
  )
}

export function AppBackground() {
  return <div className="page-glow" aria-hidden="true" />
}

