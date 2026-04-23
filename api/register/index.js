const { getPool, sql } = require("../db/connection")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports = async function (context, req) {
  const { username, email, name, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const pool = await getPool()
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("name", sql.NVarChar, name)
      .input("password", sql.NVarChar, hashedPassword)
      .query("INSERT INTO users (username, email, name, password) OUTPUT INSERTED.* VALUES (@username, @email, @name, @password)")

    const user = result.recordset[0]
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )
    return { status: 201, body: { token } }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}
