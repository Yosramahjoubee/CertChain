import { NextResponse } from 'next/server'
import { getCertificate, updateCertificate } from '../../../../lib/db'
 
// GET /api/certificates/0x...
export async function GET(_req, { params }) {
  const { hash } = await params
  const cert = await getCertificate(hash)
  if (!cert) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
  return NextResponse.json(cert)
}

export async function PATCH(req, { params }) {
  const { hash } = await params
  let body

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const cert = await getCertificate(hash)
  if (!cert) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  const updated = await updateCertificate(hash, {
    revoked: Boolean(body.revoked),
    revokedAt: body.revoked ? new Date().toISOString() : cert.revokedAt || null,
  })

  return NextResponse.json(updated)
}
 