import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { email, first_name, last_name, password, university_name, gender, year_joined } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const userQuery = "INSERT INTO auth_user (email, first_name, last_name, password) VALUES (?, ?, ?, ?)";

  db.query(userQuery, [email, first_name, last_name, hashedPassword], (err, result) => {
    if (err) return res.status(500).json(err);

    const userId = result.insertId;

    const teacherQuery = "INSERT INTO teachers (user_id, university_name, gender, year_joined) VALUES (?, ?, ?, ?)";

    db.query(teacherQuery, [userId, university_name, gender, year_joined], (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "User Registered" });
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM auth_user WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({ token });
  });
};

export const getUsers = (req, res) => {
  const query = `
    SELECT auth_user.*, teachers.*
    FROM auth_user
    JOIN teachers ON teachers.user_id = auth_user.id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};