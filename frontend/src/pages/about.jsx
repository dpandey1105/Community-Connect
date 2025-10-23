import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Handshake, Users, Target, Globe, Award, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-serif">
            About{" "}
            <span className="text-primary">Community Connect</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through meaningful volunteer connections across India
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              To bridge the gap between passionate volunteers and impactful community projects, creating lasting positive change across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                  alt="Volunteers connecting and working together"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Handshake className="text-white" size={48} />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Connect Hearts</h3>
                <p className="text-muted-foreground">
                  Bring together volunteers and organizations with shared values and goals for maximum impact.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                  alt="Community project making positive change"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                  <Target className="text-white" size={48} />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Drive Change</h3>
                <p className="text-muted-foreground">
                  Enable meaningful projects that address real community needs and create sustainable solutions.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-accent/20 to-accent/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                  alt="Building stronger communities together"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                  <Globe className="text-white" size={48} />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Build Communities</h3>
                <p className="text-muted-foreground">
                  Foster stronger, more connected communities through collaborative volunteer efforts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">Platform Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built with modern technology to ensure a seamless experience for volunteers and organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Smart Matching</h3>
                  <p className="text-muted-foreground">
                    Advanced algorithms match volunteers with projects based on skills, location, and interests for optimal engagement.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-secondary-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Verified Organizations</h3>
                  <p className="text-muted-foreground">
                    All organizations undergo verification to ensure credibility and maintain trust within our community.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="text-accent-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Impact Tracking</h3>
                  <p className="text-muted-foreground">
                    Real-time statistics and impact metrics help volunteers and organizations measure their contributions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nationwide Reach</h3>
                  <p className="text-muted-foreground">
                    Connect with projects across all 28 Indian states and union territories, from metros to rural areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}
