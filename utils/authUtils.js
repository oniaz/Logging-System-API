import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};


export const generateAPIKey = () => {
  return crypto.randomBytes(32).toString("hex");
};