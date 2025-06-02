const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_PAY_PER_USE',
  'STRIPE_PRICE_ID_SUBSCRIPTION'
] as const;

export function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate URL format
  try {
    new URL(process.env.NEXTAUTH_URL!);
  } catch {
    throw new Error('NEXTAUTH_URL must be a valid URL');
  }

  // Validate secrets minimum length
  const secretVars = [
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_SECRET',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  secretVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value.length < 32) {
      throw new Error(`${varName} should be at least 32 characters long`);
    }
  });
} 