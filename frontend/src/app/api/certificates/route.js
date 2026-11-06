import { NextResponse } from 'next/server'
import { isAddress } from 'ethers'
import { addCertificate, listCertificates, updateCertificateNames } from '../../../lib/db'

const HASH_RE = /^0x[0-9a-fA-F]{64}$/

// GET /api/certificates?student=0x...  ou  ?issuer=0x...
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const items = await listCertificates({
    student: searchParams.get('student') || undefined,
    issuer: searchParams.get('issuer') || undefined,
  })
  return NextResponse.json(items)
}

// PATCH /api/certificates : met à jour les noms dans les certificats associés à un portefeuille.
export async function PATCH(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const address = String(body.address || '').trim()
  const name = String(body.name || '').trim()
  if (!isAddress(address)) return bad('Adresse portefeuille invalide.')
  if (!name) return bad('Nom manquant.')

  const updatedCount = await updateCertificateNames(address, name.slice(0, 100))
  return NextResponse.json({ updatedCount })
}

// POST /api/certificates : enregistre un certificat après émission on-chain
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const { hash, student, issuer, title, year, metadata, txHash, studentName, issuerName } = body
  const y = Number(year)

  if (!HASH_RE.test(hash || '')) return bad('Hash invalide.')
  if (!isAddress(student || '')) return bad('Adresse étudiant invalide.')
  if (!isAddress(issuer || '')) return bad('Adresse émetteur invalide.')
  if (!String(studentName || '').trim()) return bad('Nom de l’étudiant manquant.')
  if (!String(issuerName || '').trim()) return bad('Nom de l’émetteur manquant.')
  if (!title || String(title).trim().length < 3) return bad('Intitulé manquant.')
  if (!Number.isInteger(y) || y < 1950 || y > 2100) return bad('Année invalide.')
  if (txHash && !HASH_RE.test(txHash)) return bad('Hash de transaction invalide.')

  const saved = await addCertificate({
    hash: hash.toLowerCase(),
    student: student.toLowerCase(),
    issuer: issuer.toLowerCase(),
     studentName: String(studentName || '').trim().slice(0, 100),
    issuerName: String(issuerName || '').trim().slice(0, 100),
    title: String(title).trim().slice(0, 200),
    year: y,
    metadata: String(metadata || '').trim().slice(0, 500),
    txHash: txHash ? txHash.toLowerCase() : '',
    revoked: false,
    revokedAt: null,
    createdAt: new Date().toISOString(),
  })

  if (!saved) return NextResponse.json({ error: 'Ce certificat existe déjà.' }, { status: 409 })
  return NextResponse.json(saved, { status: 201 })
}

function bad(error) {
  return NextResponse.json({ error }, { status: 400 })
}