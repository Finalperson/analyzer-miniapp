// Discord API utilities for server membership verification
import { z } from 'zod';

// Types
interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
}

interface DiscordMember {
  user: DiscordUser;
  nick?: string;
  roles: string[];
  joined_at: string;
}

// Environment variables validation
const DiscordConfig = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1, "Discord Bot Token is required"),
  DISCORD_GUILD_ID: z.string().min(1, "Discord Guild ID is required")
}).safeParse({
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID
});

if (!DiscordConfig.success) {
  console.warn("⚠️ Discord Bot Token or Guild ID not configured. Discord verification will be disabled.");
}

/**
 * Search for a Discord user by username in the Analyzer Finance server
 */
export async function findDiscordMember(username: string): Promise<DiscordMember | null> {
  if (!DiscordConfig.success) {
    throw new Error("Discord API not configured");
  }

  try {
    // Parse username (could be username#discriminator or just username)
    const parts = username.split('#');
    const usernameOnly = parts[0];
    const discriminator = parts[1];

    // Get all members from the guild (for small servers)
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DiscordConfig.data.DISCORD_GUILD_ID}/members?limit=1000`,
      {
        headers: {
          'Authorization': `Bot ${DiscordConfig.data.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const members: DiscordMember[] = await response.json();

    // Search for the user
    const member = members.find(member => {
      const user = member.user;
      
      // If discriminator is provided, match exactly
      if (discriminator) {
        return user.username.toLowerCase() === usernameOnly.toLowerCase() && 
               user.discriminator === discriminator;
      }
      
      // Otherwise, match username or global_name
      return user.username.toLowerCase() === usernameOnly.toLowerCase() ||
             user.global_name?.toLowerCase() === usernameOnly.toLowerCase();
    });

    return member || null;
  } catch (error) {
    console.error('Error finding Discord member:', error);
    throw error;
  }
}

/**
 * Check if a user is member of Analyzer Finance Discord server
 */
export async function checkDiscordMembership(username: string): Promise<boolean> {
  if (!DiscordConfig.success) {
    // Fallback: just check if username is provided (for development)
    console.warn("Discord API not configured, skipping actual membership verification");
    return username.length > 0;
  }

  try {
    const member = await findDiscordMember(username);
    return member !== null;
  } catch (error) {
    console.error('Error checking Discord membership:', error);
    throw error;
  }
}

/**
 * Validate Discord username format
 */
export function validateDiscordUsername(username: string): { valid: boolean; error?: string } {
  // Check if it's old format (username#discriminator) or new format (just username)
  const parts = username.split('#');
  
  if (parts.length > 2) {
    return { valid: false, error: "Invalid username format" };
  }
  
  const usernameOnly = parts[0];
  const discriminator = parts[1];
  
  // Username validation
  if (usernameOnly.length < 2 || usernameOnly.length > 32) {
    return { valid: false, error: "Username must be 2-32 characters" };
  }
  
  // Discriminator validation (if provided)
  if (discriminator) {
    if (!/^\d{4}$/.test(discriminator)) {
      return { valid: false, error: "Discriminator must be 4 digits (e.g., #1234)" };
    }
  }
  
  return { valid: true };
}

/**
 * Get Discord server invite link
 */
export function getDiscordInviteUrl(): string {
  return "https://discord.com/invite/EshVc7Vm7p";
}

/**
 * Instructions for users on how to find their Discord username
 */
export const DISCORD_INSTRUCTIONS = {
  en: "1. Join our Discord server\n2. Click on your profile in Discord\n3. Copy your username (with or without #1234)\n4. Paste it here to verify",
  fa: "۱. به سرور Discord ما بپیوندید\n۲. روی پروفایل خود در Discord کلیک کنید\n۳. نام کاربری خود را کپی کنید (با یا بدون #۱۲۳۴)\n۴. اینجا paste کنید تا verify شود"
};