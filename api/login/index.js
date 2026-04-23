const { getPool, sql } = require("../db/connection")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports = async function (context, req) {
  const { username, password } = req.body
  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM users WHERE username = @username")

    if (!result.recordset.length) {
      return { status: 401, body: { detail: "Invalid credentials" } }
    }
    const user = result.recordset[0]

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return { status: 401, body: { detail: "Invalid credentials" } }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )
    return { status: 200, body: { token } }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}
