// middleware/authorize.js

export function authorize(requiredRoles) {
  return (req, res, next) => {
    const roles = req.user?.realm_access?.roles || []

    const hasPermission = requiredRoles.some(role =>
      roles.includes(role)
    )

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    next()
  }
}