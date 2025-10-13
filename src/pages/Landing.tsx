import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bus, Clock, CreditCard, MapPin, Shield, Smartphone } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="glow-orb w-96 h-96 bg-primary/40 top-0 right-0 animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="glow-orb w-80 h-80 bg-secondary/40 bottom-20 left-10 animate-pulse" style={{ animationDuration: "5s" }} />
      <div className="glow-orb w-72 h-72 bg-accent/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: "6s" }} />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="glass sticky top-0 z-50 border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="./logo.svg" alt="BMTC Logo" className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight">BMTC Booking</span>
            </div>
            <div className="flex items-center gap-4">
              {!isLoading && (
                <Button
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                  className="glass-strong hover:scale-105 transition-transform"
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Book Your Bus Ticket
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience seamless bus booking with real-time seat availability, instant payments, and digital tickets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="glass-strong text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              <Bus className="mr-2 h-5 w-5" />
              {isAuthenticated ? "Go to Dashboard" : "Start Booking"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="glass text-lg px-8 py-6 hover:scale-105 transition-transform"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Hero Image/Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="glass-strong rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <Bus className="h-32 w-32 text-primary/40" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-muted-foreground">
            Modern features for a seamless booking experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MapPin,
              title: "Real-Time Tracking",
              description: "Track your bus location in real-time with live GPS updates",
              color: "text-primary",
            },
            {
              icon: Smartphone,
              title: "Smart Seat Selection",
              description: "AI-powered vacant seat detection for accurate availability",
              color: "text-secondary",
            },
            {
              icon: CreditCard,
              title: "Instant Payments",
              description: "Secure payment gateway with multiple payment options",
              color: "text-accent",
            },
            {
              icon: Clock,
              title: "Quick Booking",
              description: "Book your tickets in under 60 seconds with our streamlined process",
              color: "text-chart-4",
            },
            {
              icon: Shield,
              title: "Secure & Safe",
              description: "Your data is encrypted and protected with industry standards",
              color: "text-chart-5",
            },
            {
              icon: Bus,
              title: "Wide Network",
              description: "Access to all BMTC routes and buses across Bangalore",
              color: "text-chart-1",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="glass rounded-2xl p-8 hover:glass-strong transition-all"
            >
              <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of commuters who trust BMTC Booking for their daily travel needs.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="glass text-lg px-8 py-6 hover:scale-105 transition-transform"
          >
            <Bus className="mr-2 h-5 w-5" />
            {isAuthenticated ? "Go to Dashboard" : "Book Your First Ticket"}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="./logo.svg" alt="BMTC Logo" className="h-8 w-8" />
              <span className="font-bold">BMTC Booking System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BMTC. All rights reserved. Built with{" "}
              <a
                href="https://vly.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vly.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}