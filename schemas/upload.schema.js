import joi from "joi";

export const uploadSchema = joi.object({
  template: joi.string().required(),
  totalFiles: joi.number().integer().min(1).required(),
  clientName: joi.string().required(),
  subClientName: joi.string().optional(),
});
