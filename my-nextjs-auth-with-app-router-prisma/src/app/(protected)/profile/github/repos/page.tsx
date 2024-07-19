import RepoList from '@/components/GitHub/Repo/RepoList'
import db from '@/lib/db'

const getData = async () => {
  const repos = await db.repo.findMany({
    where: {},
    orderBy: {
      createdAt: 'desc',
    },
  })

  return repos
}

const RepoPage = async () => {
  const repos = await getData()
  return (
    <div>
      <RepoList repos={repos} />
    </div>
  )
}

export default RepoPage