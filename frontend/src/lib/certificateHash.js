import { keccak256, toUtf8Bytes } from 'ethers'
 
// Hash déterministe des détails du certificat.
// L'ordre des champs est fixe : le même diplôme donne toujours le même hash.
export function computeCertificateHash({ student, title, year, metadata }) {
  const canonical = JSON.stringify([
    student.trim().toLowerCase(),
    title.trim(),
    Number(year),
    (metadata || '').trim(),
  ])
  return keccak256(toUtf8Bytes(canonical))
}
 