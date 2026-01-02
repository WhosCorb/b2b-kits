import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Characters for code generation (avoiding ambiguous: 0/O, 1/I/l)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6
const SALT_ROUNDS = 10

// JWT secret - must be set in environment
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Token expiry in seconds (10 minutes)
const TOKEN_EXPIRY = 600

/**
 * Generate a random 6-character alphanumeric code
 */
export function generateCode(): string {
  let code = ''
  const randomValues = new Uint32Array(CODE_LENGTH)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[randomValues[i] % CODE_CHARS.length]
  }

  return code
}

/**
 * Hash a code for secure storage
 */
export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code.toUpperCase(), SALT_ROUNDS)
}

/**
 * Verify a code against its hash
 */
export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code.toUpperCase(), hash)
}

/**
 * Generate a short-lived JWT token for PDF access
 */
export function generatePdfToken(payload: {
  codeId: string
  customerType: string
}): string {
  return jwt.sign(
    {
      codeId: payload.codeId,
      customerType: payload.customerType,
      type: 'pdf_access',
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

/**
 * Verify and decode a PDF access token
 */
export function verifyPdfToken(token: string): {
  codeId: string
  customerType: string
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      codeId: string
      customerType: string
      type: string
    }

    if (decoded.type !== 'pdf_access') {
      return null
    }

    return {
      codeId: decoded.codeId,
      customerType: decoded.customerType,
    }
  } catch {
    return null
  }
}
