import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

const hasMongoDb = !!process.env.MONGODB_URI;

async function getAdapter() {
  if (!hasMongoDb) return undefined;
  const { MongoDBAdapter } = await import("@auth/mongodb-adapter");
  const { MongoClient } = await import("mongodb");

  const uri = process.env.MONGODB_URI!;
  const globalKey = "_mongoAuthClient" as const;
  const g = globalThis as unknown as Record<string, Promise<InstanceType<typeof MongoClient>>>;

  let clientPromise: Promise<InstanceType<typeof MongoClient>>;
  if (process.env.NODE_ENV === "development") {
    if (!g[globalKey]) {
      g[globalKey] = new MongoClient(uri).connect();
    }
    clientPromise = g[globalKey];
  } else {
    clientPromise = new MongoClient(uri).connect();
  }

  return MongoDBAdapter(clientPromise);
}

const config: NextAuthConfig = {
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
};

// Only attach the MongoDB adapter if MONGODB_URI is configured
if (hasMongoDb) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).adapter = getAdapter();
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);
