'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { isAddress } from 'ethers'
import { Shell, PageIntro, DemoBanner } from '../../../components/site-shell'
import { useWallet } from '../../../context/WalletContext'


export default function IssuePage() {
    const formStructure = {hash:'', student: '', title: '', year: '', metadata: '' }
  const [msg, setMsg] = useState("");

  const { contract, account } = useWallet()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(formStructure)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [txHash, setTxHash] = useState('')

  // Un seul handler pour tous les champs : utilise l'attribut name de l'input
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  async function create() {
    try {
      setMsg("Waiting for confirmation...");
      const tx = await contract.createCertificate(
        form.student, form.title, Number(form.year), form.metadata
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", tx.hash);
      console.log("Transaction receipt:", receipt);
      setForm({ ...form, hash: receipt.logs[0].topics[1] });
      setMsg("Issued. Hash: " + receipt.logs[0].topics[1]);
      
      next();
    } catch (e) {
      setMsg(e.reason || e.shortMessage || e.message);
    }
  }

 async function issue() {
    try {
      setMsg("Waiting for confirmation...");
      const tx = await contract.issueCertificate(
         form.hash,form.student
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", tx.hash);
      console.log("Transaction receipt:", receipt);
      const [studentName, issuerName] = await Promise.all([
        contract.names(form.student),
        contract.names(account),
      ]);

      if (!studentName.trim() || !issuerName.trim()) {
        throw new Error('Le nom de l’étudiant ou de l’émetteur est manquant dans le contrat.')
      }
      console.log("Student Name:", studentName);
      console.log("Issuer Name:", issuerName);
        const payload = {
        hash: form.hash,
        student: form.student,
        studentName: studentName,
        issuer: account,
        issuerName: issuerName,
        title: form.title,
        year: Number(form.year),
        metadata: form.metadata,
        txHash: tx.hash,
        revoked : false,
      }

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseBody = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(responseBody.error || `Erreur API (${res.status}).`)
      }

      setMsg("Certificat émis et enregistré. Hash : " + form.hash)
      setStatus('done')

    } catch (e) {
      setStatus('idle')
      const message = e.reason || e.shortMessage || e.message
      setMsg(message)
      setError(message)
    }
  }

  // Validation de l'étape en cours, retourne un message ou ''
  function validate(currentStep) {
    if (currentStep === 1) {
      if (!isAddress(form.student.trim())) return 'Adresse de portefeuille invalide (format 0x…).'
    }
    if (currentStep === 2) {
      if (form.title.trim().length < 3) return 'Saisissez l’intitulé du diplôme.'
      const y = Number(form.year)
      if (!Number.isInteger(y) || y < 1950 || y > new Date().getFullYear() + 1)
        return 'Année d’obtention invalide.'
      if (!form.metadata.trim()) return 'Ajoutez le lien des métadonnées (ipfs://…).'
    }
    return ''
  }

  function next() {
    const msg = validate(step)
    if (msg) return setError(msg)
    setStep((s) => Math.min(3, s + 1))
  }

  async function submit() {
    if (!contract) return setError('Connectez votre portefeuille sur le bon réseau.')
    try {
      setStatus('sending')
      setError('')

      // ⚠️ Remplacez par le vrai nom de la fonction et ses arguments (voir votre ABI)
      await issue()

    } catch (e) {
      setStatus('idle')
      setError(e.reason || e.shortMessage || e.message)
    }
  }

  function reset() {
    setForm(form)
    setStep(1)
    setStatus('idle')
    setTxHash('')
    setError('')
  }

  const busy = status === 'sending'

  return (
    <Shell>
      <div className="page-container narrow-page">
        <Link className="back-link" href="/etablissement">
          <ArrowLeft size={15} />
          Retour au registre
        </Link>

        <PageIntro
          kicker={`ÉMETTRE UN CERTIFICAT · 0${step}/03`}
          title={
            <>
              Une nouvelle preuve
              <br />
              <span>commence ici.</span>
            </>
          }
        />

        <section className="form-card issue-card">
          <div className="stepper">
            <span className={step >= 1 ? 'current' : ''}>01 Étudiant</span>
            <span className={step >= 2 ? 'current' : ''}>02 Diplôme</span>
            <span className={step >= 3 ? 'current' : ''}>03 Confirmation</span>
          </div>
 
          {status === 'done' ? (
            <div>   
            <div className="confirmation  flex flex-col ">
              <b className="mb-1">Certificat émis ✓</b>
              <p className="ml-1">{msg}</p>
       
            </div>

            <button className="primary-button flex-start mt-2" onClick={reset}>
                Émettre un autre certificat
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <label>
                  Adresse du portefeuille étudiant
                  <input
                    name="student"
                    value={form.student}
                    onChange={handleChange}
                    placeholder="0x7099…79C8"
                    autoComplete="off"
                  />
                </label>
              )}

              {step === 2 && (
                <>
                  <label>
                    Intitulé du diplôme
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Master en Informatique"
                    />
                  </label>
                  <label>
                    Année d&apos;obtention
                    <input
                      name="year"
                      type="number"
                      value={form.year}
                      onChange={handleChange}
                      placeholder="2026"
                    />
                  </label>
                  <label>
                    Lien des métadonnées
                    <input
                      name="metadata"
                      value={form.metadata}
                      onChange={handleChange}
                      placeholder="ipfs://…"
                    />
                  </label>
                </>
              )}

              {step === 3 && (
                <div className="confirmation">
                  <b>Prêt à émettre</b>
                  <p>Vérifiez les informations avant de signer avec {account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'votre portefeuille'}.</p>
                  <ul>
                    <li><strong>Étudiant :</strong> {form.student}</li>
                    <li><strong>Diplôme :</strong> {form.title}</li>
                    <li><strong>Année :</strong> {form.year}</li>
                    <li><strong>Métadonnées :</strong> {form.metadata}</li>
                  </ul>
                </div>
              )}

              {error && <p className="result invalid" role="alert">{error}</p>}

              <div className="form-actions flex felx-row justify-between">
                {step > 1 && (
                  <button
                    className="secondary-button "
                    onClick={() => setStep((s) => s - 1)}
                    disabled={busy}
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}
                <button
                  className="primary-button form-next"
                  onClick={step === 2 ? create : step === 3 ? submit : next }
                  disabled={busy}
                >
                  {busy ? 'Transaction en cours…' : step === 3 ? 'Émettre le certificat' : 'Continuer'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

           {busy? msg && <p className="form-feedback" role="status">{msg}</p>:""}

        </section>
      </div>
    </Shell>
  )
}
