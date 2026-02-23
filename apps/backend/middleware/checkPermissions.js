export const checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        const roles = req.auth.payload?.['resource_access']?.[process.env.AUDIENCE]?.roles || [];
        const hasPermission = requiredPermissions.every(p => roles.includes(p));

        if (hasPermission) return next();
        res.status(403).json({ message: 'Insufficient permissions' });
    };
};