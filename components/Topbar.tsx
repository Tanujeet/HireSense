"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function TopBar() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold">
        HireSense
      </Link>

      <nav className="flex items-center space-x-4">
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 text-sm font-Bold hover:underline">
              Sign In hy the
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              },
            }}
          />
        </SignedIn>
      </nav>
    </header>
  );
}
