import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="bg-gray-800 py-6">
      <div className="container mx-auto flex justify-between">
        <span className="text-3xl text-white font-bold tracking-tight">
          <Link to="/">Sanipure.com</Link>
        </span>
        <Link
          className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
          to="/my-hotels"
        >
          My bathrooms
        </Link>
      </div>
    </div>
  );
};

export default Header;
