const { ZodError } = require('zod');

/**
 * Validates req.body, req.query, or req.params against a Zod schema
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = await schema.parseAsync(dataToValidate);
      req[source] = parsedData; // assign sanitized/parsed data back
      next();
    } catch (error) {
      const issues = error.issues || error.errors || [];
      if (issues.length > 0 || error instanceof ZodError) {
        const formattedErrors = issues.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || 'Validation failed.',
          errors: formattedErrors,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid request payload.',
      });
    }
  };
};

module.exports = { validate };
