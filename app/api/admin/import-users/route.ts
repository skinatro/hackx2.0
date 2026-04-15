import { createAdminClient } from "@/libs/supabase/admin";
import { createClient } from "@/libs/supabase/server";
import { generatePassword } from "@/libs/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Verify requester is admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Parse request
    const body = await request.json();
    const usersToImport = body.users;

    if (!Array.isArray(usersToImport) || usersToImport.length === 0) {
      return NextResponse.json({ error: "No users provided" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    const results = [];

    // 3. Process each user
    for (const u of usersToImport) {
      try {
        const email = u.email?.trim().toLowerCase();

        // Map roles: "Team Leader" -> "leader", etc.
        let role = u.role?.trim();
        if (role === "Team Leader") role = "leader";
        else if (role === "Team Member") role = "member";
        else role = role?.toLowerCase() || "member";

        if (!email) {
          throw new Error("Missing email address");
        }

        let userId: string;
        let passwordUsed = "[EXISTS]";
        let status: "created" | "updated" = "created";

        // Check if user already exists in profiles (to get their ID)
        const { data: existingProfile } = await adminClient
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .single();

        if (existingProfile) {
          userId = existingProfile.user_id;
          status = "updated";
        } else {
          // Try to create in Auth
          const password = generatePassword();
          const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
          });

          if (createError) {
            // If user already exists in Auth but not in profiles for some reason
            if (createError.message.includes("already exists")) {
              throw new Error(`User exists in Auth but no profile found for ${email}`);
            }
            throw new Error(`Auth Error for ${email}: ${createError.message}`);
          }
          userId = authData.user.id;
          passwordUsed = password;
        }

        // Upsert profile
        const { error: profileError } = await adminClient
          .from("profiles")
          .upsert(
            {
              user_id: userId,
              name: u.name?.trim(),
              email: email,
              phone: u.phone?.trim() || null,
              domain: u.domain?.trim() || null,
              role: role,
              team_name: u.team_name?.trim(),
              avatar_gender: "male",
            },
            { onConflict: "user_id" }
          );

        if (profileError) {
          throw new Error(`Profile Error for ${email}: ${profileError.message}`);
        }

        results.push({
          name: u.name,
          email: email,
          password: passwordUsed,
          status: status,
          role: role,
          team_name: u.team_name,
        });
        successful++;
      } catch (err: any) {
        failed++;
        errors.push(err.message || String(err));
      }
    }

    return NextResponse.json({
      successful,
      failed,
      errors,
      results,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Internal server error during imports" },
      { status: 500 }
    );
  }
}
