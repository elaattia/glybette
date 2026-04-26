import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import LogoStrip from "@/components/home/LogoStrip";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <LogoStrip />
                <Features />
                <HowItWorks />
                <Stats />
                <Testimonials />
                <Pricing />
                <CTA />
            </main>
            <Footer />
        </>
    );
}
