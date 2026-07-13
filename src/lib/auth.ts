// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-admin-token-key-change-this-in-production";

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function verifyAdmin(request?: Request): Promise<DecodedToken | null> {
  try {
    let token = "";

    // 1. Check cookies (Next.js server environments)
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    if (cookieToken) {
      token = cookieToken;
    }

    // 2. Check Authorization Header if request is passed
    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    if (decoded && decoded.role === "ADMIN") {
      return decoded;
    }

    return null;
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return null;
  }
}
