import logger from './logger'
import { auth } from './firebase'

export async function FBverifyIdToken(idToken: string) {
  try {
    const decoded = await auth().verifyIdToken(idToken)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (err: any) {
    logger.error('FB verifyToken error:' + err.message)
    return {
      valid: false,
      expired:
        err.code === 'auth/id-token-expired' ||
        err.code === 'auth/argument-error',
      decoded: null
    }
  }
}
