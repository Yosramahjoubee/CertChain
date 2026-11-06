import { promises as fs } from 'fs'
import path from 'path'

const DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DIR, 'certificates.json')

// File d'attente : évite que deux écritures simultanées s'écrasent
let queue = Promise.resolve()

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf-8'))
  } catch {
    return [] // fichier absent au premier lancement
  }
}

async function writeAll(items) {
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), 'utf-8')
}

export async function listCertificates({ student, issuer } = {}) {
  const items = await readAll()
  return items.filter(
    (c) =>
      (!student || c.student === student.toLowerCase()) &&
      (!issuer || c.issuer === issuer.toLowerCase())
  )
}

export async function getCertificate(hash) {
  const items = await readAll()
  return items.find((c) => c.hash === hash.toLowerCase()) || null
}

export async function updateCertificate(hash, updates) {
  const items = await readAll()
  const index = items.findIndex((c) => c.hash === hash.toLowerCase())

  if (index === -1) return null

  items[index] = {
    ...items[index],
    ...updates,
  }

  await writeAll(items)
  return items[index]
}

export function updateCertificateNames(address, name) {
  const normalizedAddress = address.toLowerCase()
  const normalizedName = name.trim()
  const run = queue.then(async () => {
    const items = await readAll()
    let updatedCount = 0

    for (const certificate of items) {
      let changed = false
      if (certificate.student === normalizedAddress) {
        certificate.studentName = normalizedName
        changed = true
      }
      if (certificate.issuer === normalizedAddress) {
        certificate.issuerName = normalizedName
        changed = true
      }
      if (changed) updatedCount += 1
    }

    if (updatedCount > 0) await writeAll(items)
    return updatedCount
  })

  queue = run.catch(() => {})
  return run
}

// Retourne null si le hash existe déjà
export function addCertificate(cert) {
  const run = queue.then(async () => {
    const items = await readAll()
    if (items.some((c) => c.hash === cert.hash)) return null
    items.push(cert)
    await writeAll(items)
    return cert
  })
  queue = run.catch(() => {})
  return run
}