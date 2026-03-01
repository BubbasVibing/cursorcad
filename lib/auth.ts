import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

function getClientPromise() {
  if (!uri) return null;

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

const clientPromise = getClientPromise();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(clientPromise ? { adapter: MongoDBAdapter(clientPromise) } : {}),
  providers: [Google],
  pages: { signIn: "/auth/signin" },
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
