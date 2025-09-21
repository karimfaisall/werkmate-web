import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import AuthProvider from "./auth-provider";
import Providers from "@/app/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AppRouterCacheProvider>
            <AuthProvider>
                <Providers>{children}</Providers>
            </AuthProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
