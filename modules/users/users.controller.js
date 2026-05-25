import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './users.model.js';

import { hashPassword, generateAPIKey } from '../../utils/authUtils.js';
import { normalizeString } from "../../utils/stringUtils.js";

const isProduction = process.env.NODE_ENV === 'production';

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields: username, email, or password' });
        }

        const normalizedEmail = normalizeString(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const apiKey = generateAPIKey();

        const newUser = new User({ username, email: normalizedEmail, password: hashedPassword, apiKey });
        await newUser.save();

        return res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (error) {
        return next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields: email or password' });
        }

        const normalizedEmail = normalizeString(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (!existingUser || !await bcrypt.compare(password, existingUser.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const jwtToken = jwt.sign(
            { userId: existingUser._id, username: existingUser.username },
            process.env.JWT_SECRET, { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
        });
    } catch (error) {
        return next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict"
        }).status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return next(error);
    }
}

export const getApiKey = async (req, res, next) => {
    try {
        return res.status(200).json({ apiKey: req.user.apiKey });
    } catch (error) {
        return next(error);
    }
}