"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { api, setAccessToken } from "@/lib/api";
import {
    Button, Card, CardContent, CircularProgress, Container, Stack,
    Typography, Alert, Divider
} from "@mui/material";

type Invite = {
    token: string;
    email: string;
    role: "owner"|"admin"|"staff";
    account: { id: string; name: string; slug: string };
    expiresAt: string;
    isExpired: boolean;
    acceptUrl?: string;
    registerUrl?: string;
};

export default function InvitePage() {
    const params = useSearchParams();
    const token = params.get("token") ?? "";
    const router = useRouter();
    const { status, data } = useSession();

    const [invite, setInvite] = useState<Invite | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sentState, setSentState] = useState<"idle"|"ok"|"err">("idle");

    const accessToken = useMemo(
        () => (data as any)?.accessToken as string | undefined,
        [data]
    );

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const inv = await api.get(`invites/${token}`).json<Invite>();
                setInvite(inv);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    async function resendEmail() {
        if (!token) return;
        try {
            setSending(true);
            setSentState("idle");
            await api.post(`invites/${token}/actions-email`).json<{ ok: true }>();
            setSentState("ok");
        } catch {
            setSentState("err");
        } finally {
            setSending(false);
        }
    }

    async function doSignIn() {
        if (!invite) return;
        // Standard sign-in; KC email already verified & password set via email link.
        // I still pass hints for convenience if KC shows the page again.
        //TODO: use redirect_uri to avoid this or find a way to avoid this
        signIn("keycloak", {
            callbackUrl: typeof window !== "undefined" ? window.location.href : `/invite?token=${token}`,
            authorizationParams: {
                login_hint: invite.email,
                kc_action: "login",
            },
        });
    }

    async function accept() {
        if (!accessToken || !invite) return;
        setAccessToken(accessToken);

        // I did this toEnsure local user exists in API DB (maps KC sub/email)
        await api.get("users/me").json();

        // Accept membership
        await api
            .post(`invites/${invite.token}/accept`)
            .json<{ accountId: string; role: string }>();

        // Store account and bounce to dashboard
        localStorage.setItem("accountId", invite.account.id);
        router.replace("/dashboard");
    }

    if (!token)
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error">Missing invite token.</Alert>
            </Container>
        );

    if (loading)
        return (
            <Container sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress />
            </Container>
        );

    if (!invite)
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error">Invite not found.</Alert>
            </Container>
        );

    if (invite.isExpired)
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="warning">
                    This invite has expired or was already used.
                </Alert>
            </Container>
        );

    const loggedEmail = (data as any)?.user?.email as string | undefined;
    const mismatch =
        loggedEmail && loggedEmail.toLowerCase() !== invite.email.toLowerCase();

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Join {invite.account.name}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        You’re invited as <b>{invite.role}</b> using <b>{invite.email}</b>.
                    </Typography>

                    {status !== "authenticated" && (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Step 1: We’ll email you a secure link to verify your email and set a password.
                                After you finish, you’ll return to this page to accept the invite.
                            </Alert>
                            <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mb: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={resendEmail}
                                    disabled={sending}
                                >
                                    {sending ? "Sending…" : "Email me a secure link"}
                                </Button>
                                <Button variant="outlined" onClick={doSignIn}>
                                    I’m ready — Sign in
                                </Button>
                            </Stack>
                            {sentState === "ok" && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Email sent. Please check your inbox (and spam).
                                </Alert>
                            )}
                            {sentState === "err" && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    Couldn’t send the email. Try again in a moment.
                                </Alert>
                            )}
                            <Divider sx={{ my: 2 }} />
                        </>
                    )}

                    {status === "authenticated" && mismatch && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            You’re logged in as {loggedEmail}. This invite is for {invite.email}. You can still accept,
                            or sign out and re-login with the invite email.
                        </Alert>
                    )}

                    <Stack direction="row" gap={1.5}>
                        {status === "authenticated" ? (
                            <Button variant="contained" onClick={accept}>
                                Accept & Continue
                            </Button>
                        ) : (
                            <Button variant="outlined" onClick={doSignIn}>
                                Sign in to continue
                            </Button>
                        )}
                        {status === "authenticated" && (
                            <Button variant="text" onClick={() => signOut({ callbackUrl: `/invite?token=${token}` })}>
                                Sign out
                            </Button>
                        )}
                        <Button variant="text" onClick={() => router.push("/")}>
                            Cancel
                        </Button>
                    </Stack>

                    <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
                        Didn’t get the email? Click “Email me a secure link” again. The link will ask you to verify
                        your email and set a password, then send you back here to accept the invite.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
}
