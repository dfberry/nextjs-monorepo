export { default } from "next-auth/middleware";

//For the time being, the withAuth middleware only supports "jwt" as session strategy.
export const config = { matcher: ["/profile"] };

