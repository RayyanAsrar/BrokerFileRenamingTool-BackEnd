const validate = (schema, data) => {
  return schema.validate(data);
};
export default validate;


// const { value, error } = validateSchema(registerSchema, req.body);
//     if (error) {
//       throw CustomError(400, error.details[0].message);
//     }
