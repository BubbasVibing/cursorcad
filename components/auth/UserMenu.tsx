"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200/60">
        <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 py-3 border-t border-gray-200/60">
        <button
          onClick={() => signIn()}
          className="
            flex w-full items-center justify-center gap-1.5
            bg-violet-500 text-white rounded-lg h-8
            text-xs font-medium
            hover:bg-violet-600 active:scale-[0.98]
            transition-all duration-150
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
              clipRule="evenodd"
            />
          </svg>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200/60">
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt=""
          className="h-7 w-7 rounded-full border border-gray-200"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-semibold">
          {session.user?.name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">
          {session.user?.name}
        </p>
      </div>
      <button
        onClick={() => signOut()}
        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
