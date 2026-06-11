import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import {
    AuthProvider,
    ReactQueryProvider,
    ThemeProvider,
} from "@/modules/shared";
import type { AuthResponse } from "@/modules/auth/types";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";

const displayFont = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
    preload: true,
});

const sansFont = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
    preload: true,
});

const monoFont = DM_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["300", "400", "500"],
    display: "swap",
    preload: false,
});

export const metadata: Metadata = {
    title: "Zevlance — Where Great Work Gets Done",
    description: "Connect with elite freelancers...",
};

// ─── RootLayout ───────────────────────────────────────────────────────────────
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const initialUser = await serverFetch<AuthResponse>("/auth/me").catch(
        () => null,
    );

    return (
        <html
            lang="en"
            className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} antialiased`}
            suppressHydrationWarning
        >
            <body suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ReactQueryProvider>
                        <AuthProvider initialUser={initialUser}>
                            {children}
                        </AuthProvider>
                    </ReactQueryProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
