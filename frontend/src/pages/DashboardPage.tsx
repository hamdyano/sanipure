import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import { isAuthenticated } from "../api/clientApi";

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  return (
    <RevealSection className="bg-black px-6 pb-20 pt-20 text-center md:pt-28">
      <h1 className="text-4xl font-semibold text-white md:text-5xl">
        Dashboard
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
        Content coming soon.
      </p>
    </RevealSection>
  );
};

export default DashboardPage;
