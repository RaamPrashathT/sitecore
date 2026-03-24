import { Navigate } from 'react-router-dom'

const HomePage = () => {
  return (
    <div><Navigate to="/login" replace={true}/></div>
  )
}

export default HomePage