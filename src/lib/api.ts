import ky from "ky";

function getAccessToken(): string | undefined {
    try { return (window as any).__WM_ACCESS_TOKEN as string | undefined; } catch { return undefined; }
}
function getAccountId(): string | undefined {
    try { return localStorage.getItem("accountId") ?? undefined; } catch { return undefined; }
}

export const api = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_URL!,
    hooks: {
        beforeRequest: [
            (req) => {
                const t = getAccessToken();
                const acc = getAccountId();
                if (t) req.headers.set("Authorization", `Bearer ${t}`);
                if (acc) req.headers.set("x-account-id", acc);
            }
        ]
    }
});

// allow setting the token after next-auth loads
export function setAccessToken(token?: string) {
    (window as any).__WM_ACCESS_TOKEN = token;
}
