import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Heart, Shield, Star, Users, Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user && profile) {
      switch (profile.role) {
        case 'parent':
          navigate('/parent');
          break;
        case 'shadchan':
          navigate('/shadchan');
          break;
        default:
          break;
      }
    }
  }, [user, profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShadchanApp</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Button variant="outline" onClick={() => navigate("/premium")}>
                    <Crown className="h-4 w-4 mr-2" />
                    Premium
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            AI-Powered Shidduch Platform
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Making Shidduchim
            <span className="text-blue-600"> Smarter</span> &
            <span className="text-amber-600"> Easier</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Streamline the matchmaking process with AI tools, resume management,
            note-taking, and collaboration features — all designed for the
            Jewish community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/parent")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-5 w-5 mr-2" />
                  For Parents
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/shadchan")}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  For Shadchanim
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your Dashboard
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Parent Dashboard */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200"
            onClick={() => user ? navigate("/parent") : navigate("/auth")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">
                Parent Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                For parents searching for their child's match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Resume builder with guided forms
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Voice-to-text notes on matches
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  AI match search from resume library
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Zelle payments with thank-you notes
                </li>
              </ul>
              <Button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => user ? navigate("/parent") : navigate("/auth")}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Shadchan Dashboard */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-200"
            onClick={() => user ? navigate("/shadchan") : navigate("/auth")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">
                Shadchan Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                For matchmakers managing multiple families
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Match suggestion tracking
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Private notes with AI summaries
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Secure collaboration tools
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  Resume sharing with comments
                </li>
              </ul>
              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                onClick={() => user ? navigate("/shadchan") : navigate("/auth")}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Premium Page */}
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-amber-200 relative overflow-hidden"
            onClick={() => user ? navigate("/premium") : navigate("/auth")}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-white px-3 py-1 text-xs font-semibold">
              PREMIUM
            </div>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl text-amber-900">
                Premium Tools
              </CardTitle>
              <CardDescription className="text-gray-600">
                Advanced AI tools and expert consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                  AI compatibility checker
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                  Smart questions generator
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                  Voice-to-AI date reports
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                  Expert shadchan consultations
                </li>
              </ul>
              <Button
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                onClick={() => user ? navigate("/premium") : navigate("/auth")}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ShadchanApp?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h4>
              <p className="text-gray-600">
                Your family's information is protected with enterprise-grade
                security.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered
              </h4>
              <p className="text-gray-600">
                Smart matching algorithms and AI tools to streamline the
                process.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Community-Focused
              </h4>
              <p className="text-gray-600">
                Built specifically for the Jewish community by people who
                understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">ShadchanApp</span>
          </div>
          <p className="text-gray-400">
            Making shidduchim easier, one match at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
