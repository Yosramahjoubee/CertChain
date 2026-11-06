'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Menu, ShieldCheck, Wallet, X } from 'lucide-react'
import { useWallet } from '../../context/WalletContext.jsx'

const ROLE_ROUTES = {
  Admin: ['/admin'],
  'Émetteur': ['/etablissement', '/etablissement/emettre'],
  'Vérificateur': ['/verifier'],
  Person: ['/etudiant'],
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Les hooks doivent être appelés DANS le composant
  const { account, chainId, connect, disconnect , role } = useWallet()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const wrong = chainId != null && chainId !== 31337n
  const short = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''

  useEffect(() => {
    const walletRequired =
      pathname === '/admin' ||
      pathname.startsWith('/etudiant') ||
      pathname.startsWith('/etablissement')

    if (!account) {
      if (walletRequired) router.replace('/')
      return
    }

    if (wrong || !role) return

    if (pathname.startsWith('/certificat/')) return

    const destination = ROLE_ROUTES[role]
    if (destination && !destination.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      router.replace(destination[0])
      setOpen(false)
    }
  }, [account, pathname, role, router, wrong])

  async function switchNetwork() {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      })
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            },
          ],
        })
      }
    }
  }

  async function handleWallet() {
    if (!account) {
      setBusy(true)
      try {
        await connect()
      } finally {
        setBusy(false)
      }
    } else if (wrong) {
      await switchNetwork()
    } else {
      try {
        await navigator.clipboard.writeText(account)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        // presse-papiers indisponible : on ignore
      }
    }
  }

  const walletLabel = busy
    ? 'Connexion...'
    : !account
      ? 'Connecter le portefeuille'
      : wrong
        ? 'Passer sur Hardhat Local'
        : copied
          ? 'Copié'
          : short
  const roleHome = ROLE_ROUTES[role]?.[0]

  return (
    <header className="nav-shell">
      <nav className="nav" aria-label="Navigation principale">
        <a className="brand" href="/#top" aria-label="CertChain accueil">
          <span className="brand-mark">
            <ShieldCheck size={19} />
          </span>
          <span>
            Cert<span>Chain</span>
          </span>
        </a>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
         {!account  ? <a href="/#how">Fonctionnement</a> : null}
         {!account ? <a href="/#institutions">Pour les établissements</a> : null}
          {!account  ?<a href="/#docs">Docs</a> : null}
          {pathname.startsWith('/certificat/') && roleHome && (
            <a className="flex " href={roleHome} onClick={() => setOpen(false)}>
              <ArrowLeft size={14} className="mt-0.5 mr-2" /> {role === 'Person' ? 'Retour à mes certificats' : 'Retour à mon espace'}
            </a>
          )}
        </div>
        <div className="nav-actions">

      

          <span className={`network-pill ${wrong ? 'is-wrong' : ''}`}>
            <i /> {wrong ? 'Mauvais réseau' : 'Réseau local'}
          </span>
            <span className={`network-pill`}>
            {role || (account ? 'Chargement du rôle…' : 'Non connecté')}
          </span>
          <button
            className={`wallet-button ${account && !wrong ? 'is-connected' : ''}`}
            onClick={handleWallet}
            disabled={busy}
            title={account && !wrong ? 'Copier l’adresse' : undefined}
          >
            <Wallet size={16} /> {walletLabel}
          </button>

          {account && (
            <button
              className="wallet-disconnect"
              onClick={disconnect}
              aria-label="Déconnecter le portefeuille"
              title="Déconnecter"
            >
              <LogOut size={16} />
            </button>
          )}

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
