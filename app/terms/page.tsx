'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, UserCheck, Upload, Shield, Ban, Copyright, Bell, Power, AlertTriangle, Scale, RefreshCw, Gavel, Mail, Phone, ChevronRight, Menu, X, Info, Users } from 'lucide-react'

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      let current = ''
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100) {
          current = section.id
        }
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileTocOpen(false)
    }
  }

  const sections = [
    { id: 'eligibility', title: '1. Eligibility', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'account', title: '2. Account & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'content', title: '3. User Content', icon: <Upload className="w-4 h-4" /> },
    { id: 'acceptable-use', title: '4. Acceptable Use', icon: <Ban className="w-4 h-4" /> },
    { id: 'intellectual-property', title: '5. Intellectual Property', icon: <Copyright className="w-4 h-4" /> },
    { id: 'features', title: '6. Features & Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'third-party', title: '7. Third-Party Services', icon: <Shield className="w-4 h-4" /> },
    { id: 'termination', title: '8. Termination', icon: <Power className="w-4 h-4" /> },
    { id: 'disclaimers', title: '9. Disclaimers', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'liability', title: '10. Limitation of Liability', icon: <Scale className="w-4 h-4" /> },
    { id: 'indemnification', title: '11. Indemnification', icon: <Shield className="w-4 h-4" /> },
    { id: 'changes', title: '12. Changes', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'governing', title: '13. Governing Law', icon: <Gavel className="w-4 h-4" /> },
    { id: 'contact', title: '15. Contact', icon: <Mail className="w-4 h-4" /> }
  ]

  const prohibitedActions = [
    'Engage in illegal, harmful, or fraudulent activity',
    'Post content that is unlawful, defamatory, harassing, hateful, pornographic, or otherwise objectionable',
    'Infringe the intellectual property or privacy rights of others',
    'Attempt to access accounts or data without authorization',
    'Upload viruses, malware, or other harmful code',
    'Interfere with or disrupt the Service or its networks'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg">
                B
              </div>
              <span className="text-xl font-bold text-gray-900">BiteClub</span>
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Terms of Service</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-orange-600 transition-colors">Home</a>
            <a href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">Privacy</a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-orange-200 transition-all transform hover:scale-105">
              Get the App
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
            <a href="/" className="block py-2 text-gray-600">Home</a>
            <a href="/privacy" className="block py-2 text-gray-600">Privacy</a>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full font-semibold">
              Get the App
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Table of Contents - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile TOC Button */}
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full shadow-xl flex items-center space-x-2"
          >
            <Menu className="w-5 h-5" />
            <span>Sections</span>
          </button>

          {/* Mobile TOC Overlay */}
          {mobileTocOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">Jump to Section</h3>
                  <button onClick={() => setMobileTocOpen(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-orange-500">{section.icon}</div>
                      <span className="text-gray-700 text-sm">{section.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-3 prose prose-gray max-w-none">
            {/* Header */}
            <div className="mb-12">
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                <FileText className="w-3 h-3 mr-1" />
                Legal Agreement
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-600">Last updated: August 18, 2025</p>
              <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border border-orange-100">
                <p className="text-gray-700">
                  These Terms of Service ("Terms") govern your access to and use of the BiteClub mobile application and related services (the "Service"). 
                  By using the Service, you agree to these Terms.
                </p>
              </div>
            </div>

            {/* Eligibility */}
            <section id="eligibility" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-orange-500" />
                1. Eligibility
              </h2>
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-900 mb-3">
                  You must be at least <strong>13 years old</strong> to use the Service.
                </p>
                <p className="text-blue-800 text-sm">
                  If you are under the age of majority in your jurisdiction, you may use the Service only with involvement of a parent or guardian.
                </p>
              </div>
            </section>

            {/* Account & Security */}
            <section id="account" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-orange-500" />
                2. Account and Security
              </h2>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700">Provide accurate information when creating your account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700">Notify us promptly of any unauthorized use or security breach</p>
                </div>
              </div>
            </section>

            {/* User Content */}
            <section id="content" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-orange-500" />
                3. User Content
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Content Rights</h3>
                <p className="text-gray-700 mb-4">
                  You may upload, post, and share content such as photos, videos, captions, comments, recipes, and meals ("User Content").
                </p>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-900">
                    <strong>You retain your rights</strong> in your User Content. By posting, you grant BiteClub a worldwide, non-exclusive, 
                    royalty-free license to host, store, reproduce, modify (solely for display), publish, and display your User Content 
                    for operating and improving the Service.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content License</h3>
                <p className="text-gray-700 mb-3">This license allows us to:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">• Display your content to other users</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">• Store your content on our servers</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">• Format content for proper display</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">• Create backups for reliability</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  You can end this license for specific content by deleting it or your account, except for content shared with others or in routine backups.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-yellow-900">
                  <strong>Your Responsibility:</strong> You represent that you have all necessary rights to post your User Content and that 
                  it doesn't violate any law or third-party rights.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section id="acceptable-use" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Ban className="w-6 h-6 mr-2 text-orange-500" />
                4. Acceptable Use
              </h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <div className="space-y-3">
                {prohibitedActions.map((action, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs">✕</span>
                    </div>
                    <p className="text-red-900">{action}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-orange-900">
                  <strong>Enforcement:</strong> We may remove content and/or suspend or terminate accounts that violate these Terms.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual-property" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Copyright className="w-6 h-6 mr-2 text-orange-500" />
                5. Intellectual Property
              </h2>
              <p className="text-gray-700 mb-4">
                The Service, including software, design, and branding, is owned by BiteClub or its licensors and is protected by intellectual property laws.
              </p>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-purple-900">
                  Except for the limited rights expressly granted here, no license is granted to you. 
                  The BiteClub name, logo, and all related marks are our trademarks.
                </p>
              </div>
            </section>

            {/* Features & Notifications */}
            <section id="features" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-orange-500" />
                6. In-App Features and Notifications
              </h2>
              <p className="text-gray-700 mb-4">
                Some features require your permission:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Bell className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900 mb-1">Push Notifications</h3>
                  <p className="text-blue-700 text-sm">Get reminders and updates about your cooking journey</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-900 mb-1">Contact Discovery</h3>
                  <p className="text-green-700 text-sm">Find friends who are already using BiteClub</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                You can enable or disable these features in your device settings or within the app settings.
              </p>
            </section>

            {/* Third-Party Services */}
            <section id="third-party" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-orange-500" />
                7. Third-Party Services
              </h2>
              <p className="text-gray-700 mb-4">The Service integrates with:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Supabase (authentication/database)',
                  'Cloudflare Images/Stream (media)',
                  'Cloudflare Workers (media API)',
                  'Expo (push notifications)',
                  'Sentry (error reporting)'
                ].map((service, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-700">• {service}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-4">
                Your use of these features may be subject to the third-party providers' terms and privacy policies.
              </p>
            </section>

            {/* Termination */}
            <section id="termination" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Power className="w-6 h-6 mr-2 text-orange-500" />
                8. Termination
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Your Rights</h3>
                  <p className="text-green-700">You may stop using the Service at any time and delete your account in Settings.</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">Our Rights</h3>
                  <p className="text-orange-700">
                    We may suspend or terminate your access if you violate these Terms or to protect the Service or other users.
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  Upon termination, certain provisions survive, including ownership, disclaimers, limitations of liability, and dispute resolution.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section id="disclaimers" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
                9. Disclaimers
              </h2>
              <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-yellow-900 font-mono text-sm uppercase mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <p className="text-yellow-800">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." BITECLUB DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, 
                  INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE 
                  WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-orange-500" />
                10. Limitation of Liability
              </h2>
              <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-900 font-mono text-sm uppercase mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <p className="text-red-800 mb-3">
                  BITECLUB WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                  OR ANY LOSS OF DATA, PROFITS, OR REVENUE.
                </p>
                <p className="text-red-800">
                  OUR AGGREGATE LIABILITY FOR ALL CLAIMS WILL NOT EXCEED THE GREATER OF $100 OR THE AMOUNTS YOU PAID US 
                  IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section id="indemnification" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-orange-500" />
                11. Indemnification
              </h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold harmless BiteClub and its affiliates, officers, employees, and agents 
                from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) 
                arising out of or related to your use of the Service or your violation of these Terms.
              </p>
            </section>

            {/* Changes */}
            <section id="changes" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <RefreshCw className="w-6 h-6 mr-2 text-orange-500" />
                12. Changes to the Service or Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We may modify or discontinue the Service, or update these Terms, at any time.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-900">
                  If changes materially affect your rights, we will provide reasonable notice (e.g., in-app notice). 
                  Continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section id="governing" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Gavel className="w-6 h-6 mr-2 text-orange-500" />
                13. Governing Law; Dispute Resolution
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  These Terms are governed by the laws of the <strong>State of California</strong>, without regard to conflict of laws principles.
                </p>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Dispute Resolution Process:</h3>
                  <ol className="list-decimal list-inside text-purple-800 space-y-1">
                    <li>First, attempt to resolve any dispute with us informally</li>
                    <li>If unresolved, disputes will be resolved in state or federal courts in San Francisco County, California</li>
                    <li>You consent to personal jurisdiction and venue there</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* App Store EULA */}
            <section className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">14. App Store EULA</h2>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-700">
                  If you downloaded the App from Apple's App Store, your use is also subject to Apple's Licensed Application 
                  End User License Agreement (EULA). In case of conflict regarding license terms, Apple's EULA will govern 
                  to the extent required by Apple's policies.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-orange-500" />
                15. Contact
              </h2>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border border-orange-100">
                <p className="text-gray-700 mb-4">For questions about these Terms, contact us at:</p>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">BiteClub</p>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <a href="mailto:wejarrard@gmail.com" className="hover:text-orange-600 transition-colors">wejarrard@gmail.com</a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <a href="tel:+16087728104" className="hover:text-orange-600 transition-colors">+1 (608) 772-8104</a>
                  </div>
                </div>
              </div>
            </section>

            {/* Summary Box */}
            <div className="mt-16 p-6 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl border border-orange-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2 text-orange-600" />
                Quick Summary
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600">•</span>
                  <span>You must be 13+ to use BiteClub</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600">•</span>
                  <span>You own your content; we need a license to display it</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600">•</span>
                  <span>Don't post illegal or harmful content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600">•</span>
                  <span>We can terminate accounts that violate these terms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600">•</span>
                  <span>The service is provided "as is" without warranties</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-12 lg:px-12 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              B
            </div>
            <span className="font-bold text-gray-900">BiteClub</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">The social network for home cooks.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/" className="text-gray-600 hover:text-orange-600 transition-colors">Home</a>
            <a href="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-600 hover:text-orange-600 transition-colors">Terms</a>
          </div>
          <p className="text-gray-500 text-xs mt-6">© 2024 BiteClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
