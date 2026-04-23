const jwt = require("jsonwebtoken")

function verifyToken(req) {
  const authHeader = req.headersj["authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { status: 401, body: { detail: "No token provided " } }
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
    // oxlint-disable-next-line no-unused-vars
  } catch (err) {
    return { status: 401, body: { detail: "Invalid or expired token" } }
  }
}

function requireRole(decoded, ...roles) {
  if (decoded.status === 401) return decoded
  if (!roles.includes(decoded.role)) {
    return { status: 403, body: { detail: "Forbidden" } }
  }
  return null
}

module.exports = { verifyToken, requireRole }
