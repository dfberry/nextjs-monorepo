import { z } from "zod";

export type RepoType = {
    id: string
    url: string
    createdAt: Date
}


export const RepoSchema = z.object({
    url: z.string().url({ message: "Well-formed URL is required" }).transform((url) => {
      // Extract the protocol and domain, which will remove any subroutes
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}/`;
      return baseUrl;
    }),
  });

