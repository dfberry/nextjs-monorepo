import Repo from './Repo'
import NewRepo from './NewRepo'
const RepoList = ({ repos } :any) => {
    return (
      <>
      Repos
      <NewRepo />
      <hr></hr>
      <div>
        {repos.map((repo:any) => (
          <Repo key={repo.url} repo={repo}/>
        ))}
      </div>
      </>
    )
  }
  
  export default RepoList