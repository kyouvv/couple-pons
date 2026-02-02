// src/components/Login.jsx
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard"); // Redirect after login
    } catch (error) {
      console.error("Login failed", error.message);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome!</h1>
          <p className="py-6">Sign in to access your Coupons</p>
          <button onClick={handleLogin} className="btn btn-primary">
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;