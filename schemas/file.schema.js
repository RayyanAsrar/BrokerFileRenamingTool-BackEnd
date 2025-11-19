import joi from "joi";

export const uploadSchema = joi.object({
  template: joi.string().required(),
  totalFiles: joi.number().integer().min(1).required(),
  clientName: joi.string().required(),
  subClientName: joi.string().optional(),
  files: joi.any(),
});

export const renameSchema = joi.object({
  newName: joi.string().min(1).max(255).required(),
  oldName: joi.string().min(1).max(255).required(),
});

export const downloadSchema = joi.object({
  files: joi.array().items(joi.string().required()).min(1).required(),
})
