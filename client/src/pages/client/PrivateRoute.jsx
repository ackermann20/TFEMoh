import { Navigate } from 'react-router-dom';

const RequireNoAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" /> : children;
};
export default RequireNoAuth;