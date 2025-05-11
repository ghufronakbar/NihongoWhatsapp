import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 6767;
export const BASE_URL = process.env.BASE_URL || 'http://localhost:6767';
export const CLIENT_ID = process.env.CLIENT_ID;
export const TARGET_NUMBER = process.env.TARGET_NUMBER;
export const DISABLE_SANDBOX = process.env.DISABLE_SANDBOX === 'true';