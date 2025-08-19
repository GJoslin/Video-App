import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="fixed top-0 w-full flex justify-around bg-black text-white py-3 z-50">
      <Link to="/">Feed</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Navbar;
