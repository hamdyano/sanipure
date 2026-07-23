import { Link } from "react-router-dom";
import logo from "../assets/RGB_Logo_400_White.png";

const navItems = [
  { label: "Who We Are", to: "/who-we-are" },
  { label: "Category", to: "/products" },
  { label: "Projects", to: "/projects" },
  { label: "News", to: "/news" },
  { label: "Resources", to: "/resources" },
  { label: "Find Us", to: "/find-us" },
];

const Header = () => {
  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Sanipure" className="h-8 w-auto" />
        </Link>

        <nav>
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-white/90 text-xs font-medium tracking-[0.12em] uppercase hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
