import type { NextAuthOptions } from 'next-auth'
//import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import {getUserByEmail} from '../../../components/neo4jQueries';
import {createUser} from  '../../../components/neo4jQueries';

const scopes = ['identify', 'email'].join(' ');

export const options: NextAuthOptions = {
    providers: [
        /*
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
         */
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username:",
                    type: "text",
                    placeholder: "your-cool-username"
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "your-awesome-password"
                }
            },
            async authorize(credentials) {
                // This is where you need to retrieve user data
                // to verify with credentials
                // Docs: https://next-auth.js.org/configuration/providers/credentials
                const user = { id: "42", name: "apizzainudin", password: "Pa$$w0rd" }

                if (credentials?.username === user.name && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            }
        }),
        DiscordProvider({
          clientId: process.env.DISCORD_ID as string,
          clientSecret: process.env.DISCORD_SECRET as string,
          authorization: {params: {scope: scopes}},
        }),
    ],
    callbacks: {
  async jwt({ token, user }) {
    if (user?.email && user?.name) {
      const existingUser = await getUserByEmail(user.email);
      if (!existingUser) {
        const newUser = await createUser(user.email, user.name);
        return { ...token, user: newUser };
      }
    }
    return token;
  },
},
}