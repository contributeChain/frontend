import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import BottomCTA from "@/components/bottom-cta";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>DevCred - Transform GitHub Contributions into NFTs</title>
        <meta name="description" content="Transform your GitHub contributions into valuable NFTs on Lens Chain blockchain. Build your developer reputation and showcase your work." />
      </Helmet>
      
      <div className="pb-16 min-h-screen">
        <HeroSection />
        <HowItWorks />
        <BottomCTA />
      </div>
    </>
  );
}
