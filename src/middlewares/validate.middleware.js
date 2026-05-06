
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const formattedErrors = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));

     return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
        });
    
}

req.validatedData = result.data;
next();
}