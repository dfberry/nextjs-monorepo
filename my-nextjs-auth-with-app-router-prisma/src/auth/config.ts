import GitHubProvider from "next-auth/providers/github";
import type { AuthOptions, DefaultUser, DefaultSession } from "next-auth";
import NextAuth from "next-auth";

// Save to DB
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { fieldEncryptionExtension } from 'prisma-field-encryption'
const globalClient = new PrismaClient()
export const prisma = globalClient.$extends(
  // This is a function, don't forget to call it:
  fieldEncryptionExtension()
)

export const options: AuthOptions = {

  // https://github.com/nextauthjs/next-auth/issues/7727
  // @ts-expect-error - PrismaAdapter is not defined
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    // generateSessionToken: () => {
    //   return randomUUID?.() ?? randomBytes(32).toString("hex")
    // }
  },
  jwt: {
    // The maximum age of the NextAuth.js issued JWT in seconds.
    // Defaults to `session.maxAge`.
    maxAge: 60 * 60 * 24 * 30,
    // You can define your own encode/decode functions for signing and encryption
    // async encode() {},
    // async decode() {},
  },
  debug: true,
  // logger: {
  //   error(code, metadata) {
  //     console.error(code, metadata)
  //   },
  //   warn(code) {
  //     console.warn(code)
  //   },
  //   debug(code, metadata) {
  //     console.debug(code, metadata)
  //   }},
  pages: {
    signIn: "/sign-out",
    signOut: "/sign-out"
  },
  providers: [
    GitHubProvider({
      name: "GitHub",
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async jwt(props) {
      const { token, session, account, profile } = props;

      console.log("CALLBACK JWT-Props:", JSON.stringify(props, null, 2))

      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.socialauth = account.provider
      }
      // @ts-ignore
      if(profile?.login) {
        // @ts-ignore
        token.login = profile?.login
      }
      return token
    },
    async session(props) {

      console.log("CALLBACK Session-Props:", JSON.stringify(props, null, 2))
      const { session, token, user } = props;
      if (token?.login) { // Here, `profileLogin` is what you named the field when adding it to the token
        session.login = token.login;
      }
    
      if (token?.accessToken) {
        session.accessToken = token.accessToken || ''
      }
      if (token?.provider) {
        // https://next-auth.js.org/configuration/callbacks#session-callback
        // The session object is not persisted server side, even when 
        // using database sessions - only data such as the session 
        // token, the user, and the expiry time is stored in the 
        // session table.

        // @ts-ignore - token type is not defined
        session.socialauth = token?.provider?.name || '';
      }
      if (user) {
        session.id = user.id
        console.log(`CALLBACK Session-User: ${JSON.stringify(session, null, 2)}`)
      }
      return session
    },
    // async signIn({ user, account, profile, email, credentials }) {
    //   console.log("CALLBACK Sign-In:", JSON.stringify({ user, account, profile, email, credentials }, null, 2))
    //   return true
    // },
    // async redirect({ url, baseUrl }) {
    //   console.log("CALLBACK REDIRECT:", JSON.stringify({ url, baseUrl}))
    //   return baseUrl 
    // },
  },
//   events: {
//     async signIn(message) { console.log("EVENT on successful sign in", message) },
//     async signOut(message) { console.log("EVENT on signout", message) },
//     async createUser(message) { console.log("EVENT user created", message) },
//     async updateUser(message) { console.log("EVENT user updated - e.g. their email was verified", message) },
//     async linkAccount(message) { console.log("EVENT account (e.g. Twitter) linked to a user",message) },
//     async session(message) { console.log("EVENT session is active", message) },
// }
};
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    socialauth?: string
  }
}
declare module 'next-auth' {

  interface Session {
    user?: DefaultUser & { id: string; role: string };
    accessToken?: string
    id: string
    socialauth?: any
    role?: 'admin' | 'user'
    login?: string
  }

  interface User extends DefaultUser {
    role: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: 'admin' | 'user'
    login: string
  }
}
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
})
