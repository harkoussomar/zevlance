import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FreelanceHub — Where Great Work Gets Done",
    description:
        "Connect with elite freelancers or land contracts with clients who value craftsmanship. Milestone contracts, structured bids, no noise.",
    keywords: ["freelance", "contracts", "milestones", "developers", "clients"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
