import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './users.model.js';

import { hashPassword, generateAPIKey } from '../../utils/authUtils.js';

const isProduction = process.env.NODE_ENV === 'production';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields: username, email, or password' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const apiKey = generateAPIKey();

        const newUser = new User({ username, email, password: hashedPassword, apiKey });
        await newUser.save();

        return res.status(201).json({
            message: 'User registered successfully',
            // remove
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                apiKey: newUser.apiKey,
            },
        });
    } catch (error) {
        // replace later with error middleware
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields: email or password' });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser || !await bcrypt.compare(password, existingUser.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const jwtToken = jwt.sign(
            { userId: existingUser._id, username: existingUser.username },
            process.env.JWT_SECRET
            // remove
            , { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict"
            // remove
            , maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
        });
    } catch (error) {
        // replace later with error middleware
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict"
        }).status(200).json({ message: 'Logout successful' });
    } catch (error) {
        // replace later with error middleware
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getApiKey = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ apiKey: user.apiKey });
    } catch (error) {
        // replace later with error middleware
        console.error('Error fetching API key:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}