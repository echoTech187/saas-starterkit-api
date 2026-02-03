const { z } = require('zod');

const envSchema = z.object({
    // Database
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_NAME: z.string().min(1),

    // JWT
    JWT_SECRET: z.string().min(10, "JWT Secret harus cukup panjang"),
    JWT_REFRESH_SECRET: z.string().min(10),

    // Email
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string(), // atau z.coerce.number() jika ingin dikonversi
    EMAIL_HOST_USER: z.string().email(),
    EMAIL_HOST_PASSWORD: z.string().min(1),

    // App
    REDIRECT_EMAIL_URL: z.string().url()
});

// Validasi process.env
const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error("❌ Invalid environment variables:", env.error.format());
    throw new Error("Invalid environment variables");
}

module.exports = env.data;