import { Request, Response } from 'express'
import { parseInt } from 'lodash'
import logger from '../../utils/logger'
import mongoose from 'mongoose'
import { CreateDrugInput } from './drug.schema'
import {
  getDrugs,
  getUniqueForms,
  findAndUpdateDrug,
  findAndDeleteDrug,
  findDrug,
  createDrug
} from './drug.service'

// exported getDrugsHandler
export async function getDrugsHandler(req: Request, res: Response) {
  const limit = parseInt(
    typeof req.query.limit === 'string' ? req.query.limit : '20'
  )
  const offset = parseInt(
    typeof req.query.offset === 'string' ? req.query.offset : '20'
  )
  const page = parseInt(
    typeof req.query.page === 'string' ? req.query.page : '0'
  )

  try {
    const query: Record<string, unknown> = {}

    if (typeof req.query.form === 'string') {
      query['forms.form'] = req.query.form
    }

    if (typeof req.query.active_ingredient === 'string') {
      query['active_ingredients'] = req.query.active_ingredient
    }

    if (typeof req.query.name === 'string') {
      query['drug_name'] = { $regex: req.query.name, $options: 'i' }
    }

    const result = await getDrugs(query, offset * page, limit)

    if (result.CurrentPage > result.pages) {
      return res.status(400).json({ message: 'No More Pages!' })
    }

    return res.status(200).json({
      data: result.data,
      paging: {
        total: result.total,
        page: result.CurrentPage,
        pages: result.pages
      }
    })
  } catch (e) {
    if (e == 'CastError') {
      return res.status(404).json({ message: 'object not found!' })
    }

    logger.error('Error in getDrugs' + e)
    return res.status(500).json({
      message: 'something went wrong server side'
    })
  }
}

// exported getDrugsHandler
export async function getDrugIdHandler(req: Request, res: Response) {
  try {
    const query: Record<string, unknown> = {}

    if (typeof req.params.drugId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.params.drugId)) {
        return res.status(400).json({ message: 'Bad ObjectID' })
      }
      query['_id'] = req.params.drugId
    }

    const result = await findDrug(query)

    if (result) {
      return res.status(200).json(result)
    }
    return res.status(404).json({
      message: 'Drug not found!'
    })
  } catch (e) {
    if (e == 'CastError') {
      return res.status(404).json({ message: 'object not found!' })
    }

    logger.error('Error in getDrugs' + e)
    return res.status(500).json({
      message: 'something went wrong'
    })
  }
}

/**
 * createDrugHandler
 *
 * @param req:Request, res: Response
 * @return
 */
export async function createDrugHandler(
  req: Request<unknown, unknown, CreateDrugInput['body']>,
  res: Response
) {
  try {
    const drug = await findDrug({ drug_name: req.body.drug_name })
    if (drug) return res.status(406).json({ message: 'Drug already exists!' })
    return res.status(200).json(await createDrug(req.body))
  } catch (err: unknown) {
    return res.status(500).json({ message: 'Something went wrong error side' })
  }
}

export async function getFormsHandler(_: Request, res: Response) {
  const result = await getUniqueForms()
  return res.status(200).json({
    data: result
  })
}

export async function putDrugHandler(req: Request, res: Response) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.drugId)) {
      return res.status(400).json({ message: 'Bad ObjectID' })
    }
    if (req.body === null) {
      return res.status(400).json({ message: 'nothing to update!' })
    }
    const drugId = req.params.drugId
    if (!(await findDrug({ _id: drugId }))) {
      return res.status(404).json({ message: "Drug doesn't exist!" })
    }

    const result = await findAndUpdateDrug({ _id: drugId }, req.body)

    return res.status(200).json(result)
  } catch (e) {
    logger.error('Error in putDrugHandler: ' + e)

    if (e === 'CastError') {
      return res.status(404).json({ message: 'object not found!' })
    }

    logger.error('Error in putDrugsHandler:' + e)
    return res.status(500).json({
      message: 'something went wrong serverside'
    })
  }
}

export async function patchDrugHandler(req: Request, res: Response) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.drugId)) {
      return res.status(400).json({ message: 'Bad ObjectID' })
    }

    if (req.body === null) {
      return res.status(400).json({ message: 'No data to update with!' })
    }

    const drugId = req.params.drugId

    if (!(await findDrug({ _id: drugId }))) {
      return res.status(404).json({ message: "Drug doesn't exist!" })
    }

    const result = await findAndUpdateDrug({ _id: drugId }, req.body)

    return res.status(200).json(result)
  } catch (e) {
    logger.error('Error in updateDrugHandler: ' + e)

    if (e === 'CastError') {
      return res.status(404).json({ message: 'Drug not found!' })
    }

    logger.error('Error in updateDrugsHandler:' + e)
    return res.status(500).json({
      message: 'something went wrong serverside'
    })
  }
}

export async function deleteDrugHandler(req: Request, res: Response) {
  const drugId = req.params.drugId
  if (!mongoose.Types.ObjectId.isValid(drugId)) {
    return res.status(400).json({ message: 'Bad ObjectID' })
  }
  const drug = await findDrug({ _id: drugId })
  if (drug) {
    try {
      await findAndDeleteDrug({ _id: drugId })
      return res.status(200).json({ message: 'Successfully deleted.' })
    } catch (e) {
      logger.error('Error in deleteDrugsHandler:' + e)

      return res.status(500).json({
        message: 'something went wrong serverside'
      })
    }
  }

  return res.status(404).json({ message: "Drug doesn't exist!" })
}
