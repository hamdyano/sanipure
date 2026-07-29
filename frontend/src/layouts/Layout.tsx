
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
//import SearchBar from "../components/SearchBar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[oklch(21.8%_0.008_223.9)]">
      <Header />
      <Hero />

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;