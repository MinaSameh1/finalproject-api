import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

const requireUser = (_req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  logger.debug(`requireUser recieved ${user?.username}`)
  if (user) {
    return next()
  }

  return res.status(401).json({
    message: 'Please Log in or invalid token!'
  })
}

export default requireUser
