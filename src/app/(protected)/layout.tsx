"use client";
import Shell from "@/components/Shell";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status, data } = useSession();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    // boot unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") router.replace("/login");
    }, [status, router]);

    // bootstrap after token exists
    useEffect(() => {
        const token = (data as any)?.accessToken as string | undefined;
        if (status !== "authenticated" || !token) return;

        setAccessToken(token); // ensures Authorization header is set for api

        (async () => {
            try {
                const me = await api.get("auth/me").json<{ memberships: { accountId: string }[] }>();
                let accountId = me.memberships[0]?.accountId;

                if (!accountId) {
                    const created = await api.post("accounts", { json: { name: "My Company" } })
                        .json<{ id: string }>();
                    accountId = created.id;
                }

                localStorage.setItem("accountId", accountId);
                setReady(true);
            } catch {
                await signOut({ callbackUrl: "/login" });
            }
        })();
    }, [status, data]);

    if (status !== "authenticated" || !ready) return null;
    return <Shell>{children}</Shell>;
}
