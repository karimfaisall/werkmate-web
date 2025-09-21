"use client";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container, Card, CardContent, Typography, Stack, Button } from "@mui/material";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") router.replace("/dashboard");
    }, [status, router]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card sx={{ borderRadius: 4, p: 1 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Sign in to WerkMate</Typography>

                    <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                        Use your Keycloak account. Social providers (Google/Apple) will work once configured in Keycloak.
                    </Typography>
                    <Stack gap={1.5}>
                        <Button variant="contained" size="large"
                                onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}>
                            Continue with Keycloak
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}
