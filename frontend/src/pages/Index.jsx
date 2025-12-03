import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, ArrowRight, CheckCircle, Sparkles, Zap, Target } from "lucide-react";
import GraduationCap from '@/components/icons/GraduationCap';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";

const Index = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const featuresData = await apiClient.getFeatures();
        setFeatures(featuresData);
      } catch (error) {
        // Fallback to hardcoded
        setFeatures([
          {
            icon: "Users",
            title: "Alumni Network",
            description: "Connect with SGSITS alumni working in top companies worldwide"
          },
          {
            icon: "Briefcase",
            title: "Job Opportunities",
            description: "Access exclusive job postings and internships from alumni companies"
          },
          {
            icon: "TrendingUp",
            title: "Career Growth",
            description: "Get mentorship and career guidance from experienced professionals"
          },
          {
            icon: "CheckCircle",
            title: "Quality Matches",
            description: "Smart matching based on your skills, branch, and preferences"
          }
        ]);
      }
    };
    loadFeatures();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Users": return Users;
      case "Briefcase": return Briefcase;
      case "TrendingUp": return TrendingUp;
      case "CheckCircle": return CheckCircle;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="flex items-center justify-center gap-8 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="text-right text-4xl md:text-6xl font-bold font-heading">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  hire
                </motion.div>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  the
                </motion.div>
              </div>
              <motion.div
                className="w-px bg-foreground h-20 md:h-24"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
              <div className="text-left text-4xl md:text-6xl font-bold font-heading">
                <motion.div
                  className="bg-gradient-primary bg-clip-text text-transparent"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  Next Gen
                </motion.div>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  engineers
                </motion.div>
              </div>
            </motion.div>
            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              Connect with alumni, discover exclusive job opportunities, and accelerate your career with the power of our network.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Button variant="gradient" size="lg" asChild>
                <Link to="/signup">
                  Join as Student
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/signup">
                  Join as Alumni
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-background/50 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SGSITS Alumni Portal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the SGSITS community to create meaningful connections and career opportunities.
            </p>
          </div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            {features.map((feature, index) => {
              const Icon = getIcon(feature.icon);
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <motion.div
                        className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="shadow-elegant">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of SGSITS students and alumni who are already building their careers through our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/signup">
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to join • Exclusive to SGSITS community • Secure and private
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">SGSITS Alumni Portal</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SGSITS Alumni Association. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
