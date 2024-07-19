# Next.js auth notes

## Sign in call back

The call back is specified on the component where the auth signOn is used. 

```
<button
      className="bg-slate-600 px-4 py-2 text-white"
      onClick={() => signIn("github", { callbackUrl: "/profile" })}
      type="button"
    >
      Sign In With GitHub
    </button>
```

If you use the auth config object to set the signIn or redirect, these seem to take precedence.

```
async signIn({ user, account, profile, email, credentials }) {
  console.log("CALLBACK Sign-In:", JSON.stringify({ user, account, profile, email, credentials }, null, 2))
  return true
},
async redirect({ url, baseUrl }) {
  console.log("CALLBACK REDIRECT:", JSON.stringify({ url, baseUrl}))
  return baseUrl 
},
```