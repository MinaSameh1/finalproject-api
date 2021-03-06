import { prop, getModelForClass } from '@typegoose/typegoose'

class form {
  @prop({ type: () => String })
  public form?: string
  @prop({ type: () => String })
  public image?: string
}

export class drug {
  @prop({ unique: true, required: true, type: () => [String] })
  public drug_name?: string

  @prop({ required: true, type: () => Array })
  public forms?: form[]

  @prop({ required: true, type: () => String })
  public strength?: string

  @prop({ required: true, type: () => Array })
  public active_ingredients?: Array<string>

  @prop({ required: false, default: 'Discontinued', type: () => String })
  public status?: string

  @prop({ required: true, type: () => String })
  public price = 1
}

const DrugModel = getModelForClass(drug, {
  schemaOptions: { versionKey: false }
})

export default DrugModel
