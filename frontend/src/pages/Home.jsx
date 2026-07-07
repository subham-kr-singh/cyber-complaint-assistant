import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/home/Hero.jsx";
import HowItWorks from "../components/home/HowItWorks.jsx";
import Features from "../components/home/Features.jsx";
import CTASection from "../components/home/CTASection.jsx";
import Footer from "../components/home/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-paperText/60">
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header>
        <Navbar />
      </header>
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
