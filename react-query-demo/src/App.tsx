import { useQuery } from "@tanstack/react-query"

interface User {
  id: number;
  name: string;
}

function fetchUsers(): Promise<User[]> {
  console.log("Data fetched: ");
  return fetch("https://jsonplaceholder.typicode.com/users")
    .then(res => res.json())
}

export default function App() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    gcTime: 5000,
    staleTime: 10000
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => refetch()}>Refetch</button>
      {data?.map(user => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  )
}
