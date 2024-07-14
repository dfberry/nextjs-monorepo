'use client'

import { useEffect } from 'react'

const Error = ({ error, reset }:any) => {

    useEffect(() => {
        console.log(error)
    }, [error])


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100">
      <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h1>
      <button onClick={()=>reset()} className="mt-4 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700 transition-colors">Try again</button>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
        <pre className="text-sm text-gray-800">{JSON.stringify(error, null, 2)}</pre>
      </div>
    </div>
  )
}

export default Error