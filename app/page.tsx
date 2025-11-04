'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, Users, BookOpen, Camera, TrendingUp, Heart, Menu, X, ChefHat, Award, LineChart } from 'lucide-react'

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
      title: "Build Your Cooking Profile",
      description: "Every dish you log becomes part of your cooking story. Create a living record of who you are as a cook."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Connect Through Cooking",
      description: "See what your friends are making. Share recipes. Cook together, apart."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Your Personal Cookbook",
      description: "Save recipes, add your notes, and build a collection that reflects your taste."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Watch Yourself Grow",
      description: "Track your journey from simple meals to complex techniques. See your progress over time."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Celebrate Each Other",
      description: "Share encouragement, exchange tips, and build a community around real cooking."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Define Your Style",
      description: "Your profile tells your cooking story. What you make, how you make it, what matters to you."
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ color: '#3D352E' }}>
      {/* Simple Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-50 to-white" />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="BiteClub"
              width={40}
              height={40}
              className="rounded-xl shadow-lg"
            />
            <span className="text-xl font-bold" style={{ color: '#3D352E' }}>BiteClub</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            <a href="#join" className="text-gray-600 hover:text-gray-900 transition-colors">Get Started</a>
            <button className="px-6 py-2.5 text-white rounded-full font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#c71c39' }}>
              Get the App
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            style={{ color: '#3D352E' }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg p-6 space-y-4 border-b border-gray-200 shadow-xl">
            <a href="#features" className="block py-2 text-gray-600">Features</a>
            <a href="#about" className="block py-2 text-gray-600">About</a>
            <a href="#join" className="block py-2 text-gray-600">Get Started</a>
            <button className="w-full px-6 py-3 text-white rounded-full font-semibold" style={{ backgroundColor: '#c71c39' }}>
              Get the App
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full mb-8 border border-gray-200">
            <ChefHat className="w-4 h-4" style={{ color: '#c71c39' }} />
            <span className="text-sm font-semibold" style={{ color: '#3D352E' }}>Your Cooking. Your Story. Your Community.</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: '#3D352E' }}>
            Build Your
            <br />
            <span style={{ color: '#c71c39' }}>Cooking Identity</span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            BiteClub gives you a relationship with your cooking. Like Strava for running or Goodreads for reading, BiteClub is where you build a living record of who you are as a cook.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="group px-8 py-4 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center" style={{ backgroundColor: '#c71c39' }}>
              Start Your Profile
              <Camera className="ml-2 w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-100 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all border border-gray-200" style={{ color: '#3D352E' }}>
              See How It Works
            </button>
          </div>

          <div className="mt-12">
            <ChevronDown className="w-8 h-8 mx-auto text-gray-400" />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative z-10 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#3D352E' }}>
              More than a recipe app
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              BiteClub is about identity. It's about who you are as a cook and how you share that with others.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#c71c39' }}>
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-xl" style={{ color: '#3D352E' }}>Your Cooking Story</h3>
              <p className="text-gray-600">Every dish becomes part of your profile. Build a visual record of your cooking journey over time.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#c71c39' }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-xl" style={{ color: '#3D352E' }}>Real Community</h3>
              <p className="text-gray-600">Connect with friends through what you cook. No algorithms, no ads—just authentic sharing.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#c71c39' }}>
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-xl" style={{ color: '#3D352E' }}>Pride in Progress</h3>
              <p className="text-gray-600">See yourself grow as a cook. Track what you make, celebrate wins, learn from experiments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#3D352E' }}>
              Built for your cooking life
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple tools that help you document, share, and grow as a cook.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl border border-gray-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md" style={{ backgroundColor: '#c71c39' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#3D352E' }}>{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#3D352E' }}>
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, intentional, and rewarding. BiteClub fits naturally into your cooking life.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#c71c39' }}>
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#3D352E' }}>Cook & Document</h3>
              <p className="text-gray-600 max-w-sm mx-auto">Log what you make. Add photos. Save recipes. Every meal becomes part of your story.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#c71c39' }}>
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#3D352E' }}>Share & Connect</h3>
              <p className="text-gray-600 max-w-sm mx-auto">Let friends see what you're cooking. Discover what inspires them. Build connections through food.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#c71c39' }}>
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#3D352E' }}>Build Your Identity</h3>
              <p className="text-gray-600 max-w-sm mx-auto">Your profile becomes a reflection of you as a cook. A record you're proud of.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="relative z-10 py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 lg:p-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#3D352E' }}>
              Start building your cooking identity
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join home cooks who are documenting their cooking journey, sharing with friends, and building something they're proud of.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="px-8 py-4 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#c71c39' }}>
                Get Started
              </button>
              <button className="px-8 py-4 bg-gray-100 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all border border-gray-200" style={{ color: '#3D352E' }}>
                Learn More
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Available on iOS and Android
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#3D352E' }}>
              What makes BiteClub different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're focused on giving people a deeper relationship with their cooking—one that celebrates progress, community, and authentic creativity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-3" style={{ color: '#3D352E' }}>Reward Authentic Cooking</h3>
              <p className="text-gray-600">No algorithms chasing virality. Just you, your cooking, and the people who matter. Share what you make, not what performs.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-3" style={{ color: '#3D352E' }}>Own Your Cooking Story</h3>
              <p className="text-gray-600">Your profile is yours. A living record of your cooking journey that grows with you and reflects who you are.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-3" style={{ color: '#3D352E' }}>Connect Through Food</h3>
              <p className="text-gray-600">See what friends are making. Solve "what's for dinner" together. Build real connections, not follower counts.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-xl mb-3" style={{ color: '#3D352E' }}>Grow as a Cook</h3>
              <p className="text-gray-600">Track your progress over time. See patterns in what you cook. Celebrate how far you've come.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 lg:py-32 px-6 lg:px-12" style={{ backgroundColor: '#c71c39' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to start your cooking story?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join BiteClub and build a relationship with your cooking.
          </p>

          <button className="px-10 py-4 bg-white rounded-full font-semibold text-lg hover:bg-gray-100 transition-all flex items-center justify-center mx-auto" style={{ color: '#c71c39' }}>
            Get the App
            <Camera className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 px-6 py-12 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/icon.png"
                  alt="BiteClub"
                  width={32}
                  height={32}
                  className="rounded-lg shadow-md"
                />
                <span className="font-bold" style={{ color: '#3D352E' }}>BiteClub</span>
              </div>
              <p className="text-gray-600 text-sm">Your cooking identity. Your community.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#3D352E' }}>Product</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>Features</p>
                <p>How it Works</p>
                <p>FAQ</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#3D352E' }}>Company</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>About</p>
                <p>Blog</p>
                <p>Contact</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#3D352E' }}>Connect</h4>
              <div className="space-y-2 text-gray-600 text-sm">
                <p>Twitter</p>
                <p>Instagram</p>
                <p>Support</p>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-200">
            © 2024 BiteClub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}