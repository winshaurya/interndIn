import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      {/* Hero Section */}
      <section className="py-16 md:py-20 w-full">
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


    </div>
  );
};

export default Index;
