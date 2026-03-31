import Link from "next/link";
import AuthHeaderActions from "./AuthHeaderActions";

function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 pb-0.5"
        >
            {children}
        </Link>
    );
}

export function Navbar() {
    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-foreground tracking-tight">
                        Freelance<span className="text-primary">Hub</span>
                    </span>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink href="/projects">Projects</NavLink>
                    <NavLink href="/talent">Talent</NavLink>
                    <NavLink href="/contracts">Contracts</NavLink>
                </div>

                {/* Actions */}
                <AuthHeaderActions />
            </nav>
        </header>
    );
}