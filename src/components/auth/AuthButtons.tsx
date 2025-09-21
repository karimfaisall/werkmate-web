"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@mui/material";

export function AuthButtons() {
    const { status } = useSession();
    return status === "authenticated" ? (
        <Button color="inherit" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</Button>
    ) : (
        <Button color="inherit" onClick={() => signIn("keycloak")}>Sign in</Button>
    );
}
