import bcrypt from "bcryptjs";

const ROUNDS = 10

export const bcryptPassword = async (password, salt) => await bcrypt.hash(password, salt);

export const generateBcryptSalt = async () => await bcrypt.genSalt(ROUNDS)

export const compareHashedPassword = async (plainPassword, hashedPassword) => bcrypt.compare(plainPassword, hashedPassword);