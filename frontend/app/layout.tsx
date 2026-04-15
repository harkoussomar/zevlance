import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Toaster } from "sonner";
import {
    AuthProvider,
    ReactQueryProvider,
    ThemeProvider,
} from "@/modules/shared";

const displayFont = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["400", "500", "600", "700", "800"],
    display: "swap",
    preload: true, // primary display font — preload it
});

const sansFont = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
    preload: true, // body font used everywhere — preload it
});

const monoFont = DM_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["300", "400", "500"],
    display: "swap",
    preload: false, // code blocks only — lazy load is fine
});

export const metadata: Metadata = {
    title: "Zevlance — Where Great Work Gets Done",
    description: "Connect with elite freelancers...",
};

// 1. Create a "Wrapper" component that handles the async cookie data
async function AuthWrapper({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const hasSession = cookieStore.has("has_session");

    return (
        <AuthProvider initialHasSession={hasSession}>{children}</AuthProvider>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} antialiased`}
            suppressHydrationWarning
        >
            <body
            suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ReactQueryProvider>
                        <Suspense fallback={null}>
                            <AuthWrapper>{children}</AuthWrapper>
                        </Suspense>
                    </ReactQueryProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
