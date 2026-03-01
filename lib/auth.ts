import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Return a promise that never resolves during build —
    // auth routes won't be called without a real DB anyway.
    return new Promise(() => {});
  }

  const globalKey = "_mongoAuthClient" as const;
  const g = globalThis as unknown as Record<string, Promise<MongoClient>>;

  if (process.env.NODE_ENV === "development") {
    if (!g[globalKey]) {
      g[globalKey] = new MongoClient(uri).connect();
    }
    return g[globalKey];
  }

  return new MongoClient(uri).connect();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getClientPromise()),
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
