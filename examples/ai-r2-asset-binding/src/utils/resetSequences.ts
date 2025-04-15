import { neon } from "@neondatabase/serverless";

export async function resetSequences(databaseUrl: string) {
    const sql = neon(databaseUrl);

    // Reset the users table sequence to continue from the highest ID
    await sql`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true)`;

    console.log("Database sequences have been reset successfully");
}