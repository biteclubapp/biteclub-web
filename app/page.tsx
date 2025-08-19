'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Users, BookOpen, Camera, TrendingUp, Heart, MessageCircle, Star, ArrowRight, Check, Menu, X, Sparkles, Zap } from 'lucide-react'

export default function Page() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Log Every Meal",
      description: "Snap photos, add notes, and build your personal cookbook of wins"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Follow Friends' Kitchens",
      description: "See what your crew is cooking in real-time, just like following workouts"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Save & Share Recipes",
      description: "Import from anywhere or create your own - never lose a recipe again"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track Your Journey",
      description: "Watch your cooking skills evolve with every meal you log"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Celebrate Together",
      description: "Give kudos, swap tips, and keep the kitchen conversation alive"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Set Cooking Goals",
      description: "Challenge yourself to try new cuisines, techniques, or ingredients"
    }
  ]

  const earlyAccessPerks = [
    "Claim your unique username",
    "Shape the future of BiteClub",
    "Exclusive founding member badge",
    "Priority access to new features",
    "Join the first 1,000 members"
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-pink-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-[128px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100/20 rounded-full blur-[200px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg">
              B
            </div>
            <span className="text-xl font-bold text-gray-900">BiteClub</span>
            <span className="hidden sm:inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-semibold rounded-full ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              LAUNCHING SOON
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#how" className="text-gray-600 hover:text-orange-600 transition-colors">How it Works</a>
            <a href="#early-access" className="text-gray-600 hover:text-orange-600 transition-colors">Early Access</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-orange-200 transition-all transform hover:scale-105">
              Join Waitlist
            </button>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg p-6 space-y-4 border-b border-gray-100 shadow-xl">
            <a href="#features" className="block py-2 text-gray-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#how" className="block py-2 text-gray-600 hover:text-orange-600 transition-colors">How it Works</a>
            <a href="#early-access" className="block py-2 text-gray-600 hover:text-orange-600 transition-colors">Early Access</a>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold">
              Join Waitlist
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full mb-8 border border-orange-200">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">The Brand New Social Network for Home Cooks</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">See What Your Friends</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Are Cooking Tonight
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            BiteClub is the Strava for cooking. Share your meals, discover amazing recipes, and turn every dish into a social experience. Join the kitchen revolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-orange-200 transition-all transform hover:scale-105 flex items-center justify-center">
              Get Early Access
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all border border-gray-200">
              Watch Demo
            </button>
          </div>

          {/* Launch Countdown */}
          <div className="inline-flex items-center space-x-6 px-6 py-4 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">127</div>
              <div className="text-xs text-gray-500 uppercase">Spots Left</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">873</div>
              <div className="text-xs text-gray-500 uppercase">On Waitlist</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Jan '25</div>
              <div className="text-xs text-gray-500 uppercase">Launch Date</div>
            </div>
          </div>

          <div className="animate-bounce mt-12">
            <ChevronDown className="w-8 h-8 mx-auto text-gray-400" />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-orange-50/50 to-pink-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Why BiteClub
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Finally, a social network that celebrates
              <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent"> real cooking</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-4xl mb-3">🍳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Not Just Pretty Pictures</h3>
              <p className="text-gray-600 text-sm">Track your cooking journey with real stats, streaks, and achievements</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Real Friends</h3>
              <p className="text-gray-600 text-sm">See what your actual friends are cooking, not influencers or ads</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Built for Home Cooks</h3>
              <p className="text-gray-600 text-sm">Quick logging, smart recipe import, and features that actually help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              Everything you need to make
              <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent"> cooking social</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building the features home cooks actually want. No fluff, just the good stuff.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl border border-gray-100 transition-all hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12 bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              As Easy as
              <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent"> Cook, Snap, Share</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Cook Something Amazing</h3>
              <p className="text-gray-600">Whether it's your grandma's recipe or a wild experiment, every meal counts</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Share with Your Crew</h3>
              <p className="text-gray-600">Post photos, add details, and let your friends see what you're plating up</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Get Inspired Daily</h3>
              <p className="text-gray-600">Discover new dishes, save recipes, and turn your feed into your cookbook</p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section id="early-access" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-6">
                <Zap className="w-3 h-3 mr-1" />
                LIMITED EARLY ACCESS
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Be Part of the
                <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent"> Founding Community</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join the first 1,000 members shaping the future of social cooking. Get exclusive perks and help us build the platform home cooks deserve.
              </p>
              
              <div className="space-y-4 mb-8">
                {earlyAccessPerks.map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-orange-200 transition-all transform hover:scale-105 flex items-center justify-center">
                  Claim Your Spot
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all border border-gray-200">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <div className="h-full bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl flex items-center justify-center border border-orange-100">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">Launching January 2025</p>
                    <p className="text-gray-600 mb-6">Be first to experience the future of social cooking</p>
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      127 spots remaining
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-full text-sm font-semibold shadow-xl border border-gray-100 animate-bounce">
                <Heart className="inline w-4 h-4 mr-1 text-red-500" /> 42 kudos
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-full text-sm font-semibold shadow-xl border border-gray-100 animate-bounce animation-delay-1000">
                <MessageCircle className="inline w-4 h-4 mr-1 text-blue-500" /> "Looks amazing!"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Vision */}
      <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            We're Building Something
            <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent"> Special</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            BiteClub isn't just another app. It's a movement to bring people together through food, celebrate home cooking, and make every meal a shared experience. 
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Kitchen</h3>
              <p className="text-gray-600 text-sm">Connect with home cooks worldwide and discover authentic recipes from every culture</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="font-semibold text-gray-900 mb-2">Level Up Together</h3>
              <p className="text-gray-600 text-sm">Track progress, earn achievements, and motivate each other to try new things</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-3">❤️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Connections</h3>
              <p className="text-gray-600 text-sm">Bond over shared meals, family recipes, and the universal language of good food</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-12 bg-gradient-to-br from-orange-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Ready to Join the Kitchen Revolution?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Don't miss your chance to be part of BiteClub from day one. Limited spots available.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-black/20 transition-all transform hover:scale-105 flex items-center justify-center">
              Get Early Access Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/50">
              Follow Our Journey
            </button>
          </div>
          
          <p className="text-white/80 text-sm mt-8">
            🔥 873 people on the waitlist • 127 early access spots left
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 px-6 py-12 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                  B
                </div>
                <span className="font-bold text-gray-900">BiteClub</span>
              </div>
              <p className="text-gray-600 text-sm">The social network for home cooks. Launching January 2025.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>Features</p>
                <p>Roadmap</p>
                <p>FAQ</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>About</p>
                <p>Blog</p>
                <p>Press Kit</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>Twitter</p>
                <p>Instagram</p>
                <p>Contact</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-200">
            © 2024 BiteClub. All rights reserved. Made with ❤️ for home cooks everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}