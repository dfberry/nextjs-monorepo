'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { RepoType, RepoSchema } from '@/lib/schema/repo'
import Repo from '@/components/GitHub/Repo/Repo'


export const createNewRepo = async (data: FormData) => {
  const newRepo = data.get('repo') as string
  if(!newRepo) return { success: false, message: 'Empty repo name' }

  console.log(`newRepo: ${newRepo}`)

  const { error: zodError } = RepoSchema.safeParse({ url: newRepo })
  if (zodError) {
    console.log('createNewRepo: Invalid url ', zodError.format());
    return ({ success: false, message: `invalid input`, error: zodError.format()});
  }

  const existingRepo = await db.repo.findUnique({
    where: { url: newRepo },
  });

  if (existingRepo) {
    console.log('Repo already exists');
    return { success: false, message: 'Repo already exists' };
  }

  if (newRepo) {
    await db.repo.create({
      data: {
        url: newRepo,
      },
    });

    revalidatePath('/profiles/github');
    console.log('Repo created successfully');
    return { success: true, message: 'Repo created successfully' };
  } else {
    console.log('Invalid repo name');
    return { success: false, message: 'Invalid repo name' };
  }
}

export const deleteRepo = async (id: string) => {
    await db.repo.delete({
      where: { id }
    })
    revalidatePath('/profiles/github')
  }
