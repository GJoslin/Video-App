function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-2xl mb-4 text-center font-bold">Login</h2>
        <input type="text" placeholder="Username" className="w-full mb-3 p-2 rounded bg-gray-700" />
        <input type="password" placeholder="Password" className="w-full mb-3 p-2 rounded bg-gray-700" />
        <button className="w-full bg-red-500 p-2 rounded">Login</button>
        <p className="text-sm text-center mt-3">Don’t have an account? <span className="text-red-400 cursor-pointer">Register</span></p>
      </div>
    </div>
  );
}

export default Login;
