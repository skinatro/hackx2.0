import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Load Environment Variables from .env.local manually for the script context
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      // Basic key=value parsing skipping comments
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || "").trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
    console.log("✅ Loaded environment from .env.local");
  } else {
    console.warn("⚠️ .env.local not found. Relying on system environment variables.");
  }
}

async function resetAdmins() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
    process.exit(1);
  }

  if (serviceRoleKey.includes("dummy")) {
    console.error("❌ Error: Service role key appears to be a placeholder. Please update .env.local with real credentials.");
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const targetAdmins = [
    { email: "csi@sfit.ac.in", name: "CSI SFIT Organizer" },
    { email: "gdgsfit@gmail.com", name: "GDG SFIT Organizer" },
  ];

  const PASSWORD = "HackX2026_Admin!"; // Known password for the user

  console.log(`\n🚀 Starting Admin Reset (Password: ${PASSWORD})\n`);

  for (const admin of targetAdmins) {
    console.log(`Processing: ${admin.email}...`);

    try {
      // 1. Check if user exists (listUsers iterates via pagination, but we just try to create for simplicity)
      const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
        email: admin.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: admin.name }
      });

      let userId = authData?.user?.id;

      if (createError) {
        if (createError.message.includes("already registered") || createError.message.includes("exists")) {
          console.log(`   User already exists. Updating password instead...`);
          
          // Get the user ID first
          const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
          if (listError) throw listError;
          
          const existingUser = listData.users.find(u => u.email === admin.email);
          if (!existingUser) throw new Error("Could not find existing user ID");
          
          userId = existingUser.id;
          const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
            password: PASSWORD,
          });
          
          if (updateError) throw updateError;
        } else {
          throw createError;
        }
      }

      // 2. Ensure profile exists with correct role
      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
          user_id: userId,
          name: admin.name,
          email: admin.email,
          role: "admin",
          team_name: "Organizer Committee",
          domain: "Management"
        }, { onConflict: "user_id" });

      if (profileError) throw profileError;

      console.log(`   ✅ Success! ${admin.email} is now an admin.`);
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  console.log("\nFinished processing all admins.");
}

resetAdmins();
