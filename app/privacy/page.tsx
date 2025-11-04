'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, Shield, Database, Share2, Clock, Settings, Users, Globe, Mail, Phone, ChevronRight, Menu, X, Check } from 'lucide-react'

export default function PrivacyPage() {
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
    { id: 'summary', title: 'Summary', icon: <Shield className="w-4 h-4" /> },
    { id: 'what-we-collect', title: 'What We Collect', icon: <Database className="w-4 h-4" /> },
    { id: 'how-we-use', title: 'How We Use Information', icon: <Settings className="w-4 h-4" /> },
    { id: 'sharing', title: 'Sharing & Disclosures', icon: <Share2 className="w-4 h-4" /> },
    { id: 'retention', title: 'Retention & Deletion', icon: <Clock className="w-4 h-4" /> },
    { id: 'your-rights', title: 'Your Rights', icon: <Users className="w-4 h-4" /> },
    { id: 'international', title: 'International Transfers', icon: <Globe className="w-4 h-4" /> },
    { id: 'contact', title: 'Contact Us', icon: <Mail className="w-4 h-4" /> }
  ]

  const dataTable = [
    {
      category: 'Account identifiers',
      examples: 'Phone (for SMS sign-in), optional email, username, name, avatar URL',
      purpose: 'Account creation, authentication, social features',
      required: 'Phone or email required to sign in',
      retention: 'Until account deletion'
    },
    {
      category: 'User content',
      examples: 'Photos, videos, captions, comments, likes, recipes, meals, collections',
      purpose: 'Provide core social/journaling features',
      required: 'Optional but necessary to post',
      retention: 'Until you delete content or your account'
    },
    {
      category: 'Contacts matching',
      examples: 'Phone numbers you choose to share for "find friends"',
      purpose: 'One-time matching to find existing users',
      required: 'Optional',
      retention: 'Query-time only; not stored'
    },
    {
      category: 'Notifications',
      examples: 'Expo push token, on-device reminder times',
      purpose: 'Deliver push reminders and in-app notifications',
      required: 'Optional',
      retention: 'While enabled; removed on disable'
    },
    {
      category: 'Usage & device data',
      examples: 'App interactions, error logs; device type (iOS/Android)',
      purpose: 'App functionality, performance, debugging',
      required: 'Collected automatically',
      retention: 'Short-term logs'
    }
  ]

  return (
    <div className="min-h-screen bg-white" style={{ color: '#3D352E' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <Image
                src="/icon.png"
                alt="BiteClub"
                width={40}
                height={40}
                className="rounded-xl shadow-lg"
              />
              <span className="text-xl font-bold" style={{ color: '#3D352E' }}>BiteClub</span>
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Privacy Policy</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a>
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
            <a href="/" className="block py-2 text-gray-600">Home</a>
            <a href="/terms" className="block py-2 text-gray-600">Terms</a>
            <button className="w-full px-6 py-3 text-white rounded-full font-semibold" style={{ backgroundColor: '#c71c39' }}>
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
              <h3 className="font-semibold mb-4" style={{ color: '#3D352E' }}>Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={activeSection === section.id ? { backgroundColor: '#c71c39' } : {}}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile TOC Button */}
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-3 text-white rounded-full shadow-xl flex items-center space-x-2"
            style={{ backgroundColor: '#c71c39' }}
          >
            <Menu className="w-5 h-5" />
            <span>Sections</span>
          </button>

          {/* Mobile TOC Overlay */}
          {mobileTocOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold" style={{ color: '#3D352E' }}>Jump to Section</h3>
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
                      <div style={{ color: '#c71c39' }}>{section.icon}</div>
                      <span className="text-gray-700">{section.title}</span>
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
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full mb-4 border border-gray-200" style={{ color: '#c71c39' }}>
                <Shield className="w-3 h-3 mr-1" />
                Privacy First
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#3D352E' }}>Privacy Policy</h1>
              <p className="text-xl text-gray-600">Last updated: August 18, 2025</p>
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-700">
                  This Privacy Policy explains how BiteClub collects, uses, discloses, and safeguards your information when you use our mobile application.
                  If you do not agree with this policy, please do not use the App.
                </p>
              </div>
            </div>

            {/* Summary Section */}
            <section id="summary" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Shield className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                Summary for App Store Privacy
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="font-semibold text-green-900">No Tracking</h3>
                  </div>
                  <p className="text-green-700 text-sm">We don't track you across apps or websites</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Your Data</h3>
                  </div>
                  <p className="text-blue-700 text-sm">Contact info, content, and social connections stay yours</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center mb-2">
                    <X className="w-5 h-5 mr-2 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">No Ads</h3>
                  </div>
                  <p className="text-purple-700 text-sm">No third-party advertising or data selling</p>
                </div>
              </div>
            </section>

            {/* What We Collect */}
            <section id="what-we-collect" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Database className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                What We Collect
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: '#c71c39' }}>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Examples</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Purpose</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Required?</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#3D352E' }}>{row.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.examples}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.purpose}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.required}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-900 text-sm">
                  <strong>Note:</strong> We do not collect sensitive data such as precise location, health information, financial data, or biometric information.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#3D352E' }}>Device Permissions</h3>
                <p className="text-gray-600 mb-4">We request the following device permissions:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: 'Camera', desc: 'To take photos of your meals' },
                    { name: 'Photos/Library', desc: 'To upload existing photos' },
                    { name: 'Notifications', desc: 'To send cooking reminders' },
                    { name: 'Contacts', desc: 'Optional - to find friends' }
                  ].map((perm, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#c71c39' }} />
                      <div>
                        <span className="font-medium" style={{ color: '#3D352E' }}>{perm.name}:</span>
                        <span className="text-gray-600 ml-1 text-sm">{perm.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mt-3">You can change permissions in your device settings at any time.</p>
              </div>
            </section>

            {/* How We Use Information */}
            <section id="how-we-use" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Settings className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                How We Use Information
              </h2>
              <div className="space-y-3">
                {[
                  'Provide and secure the App, authenticate users, and maintain your account',
                  'Enable social features (following, posting, commenting, liking)',
                  'Deliver push notifications and daily reminders you configure',
                  'Improve performance, debug issues, and protect against abuse'
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: '#c71c39' }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-900 font-medium">
                  We do not sell your personal data and we do not use your data for third-party advertising or cross-app tracking.
                </p>
              </div>
            </section>

            {/* Sharing and Disclosures */}
            <section id="sharing" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Share2 className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                Sharing and Disclosures
              </h2>
              <p className="text-gray-700 mb-4">We share data with service providers acting on our behalf:</p>
              <div className="space-y-3">
                {[
                  { name: 'Supabase', desc: 'Authentication and database' },
                  { name: 'Cloudflare Images/Stream', desc: 'Media storage and delivery' },
                  { name: 'Cloudflare Workers', desc: 'Media API and scheduled cleanup' },
                  { name: 'Expo', desc: 'Push notification delivery' },
                  { name: 'Sentry (Toucan)', desc: 'Error reporting (may include user ID for debugging)' }
                ].map((service, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold" style={{ color: '#3D352E' }}>{service.name}:</span>
                    <span className="text-gray-600 ml-2">{service.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-4">
                We may disclose information to comply with law, protect rights and safety, or as part of a business transfer.
              </p>
            </section>

            {/* Retention and Deletion */}
            <section id="retention" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Clock className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                Retention and Deletion
              </h2>
              <div className="space-y-3">
                {[
                  'Your content and profile persist until you delete them or delete your account',
                  'Push tokens are retained only while notifications are enabled',
                  'Contacts matching operates at query time; numbers are not stored beyond the lookup',
                  'Backups and logs retain limited data for a short period for security and reliability',
                  'When you delete your account, media deletions may take up to ~1 hour to propagate'
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#c71c39' }} />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Users className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                Your Choices and Rights
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2" style={{ color: '#3D352E' }}>Manage Notifications</h3>
                  <p className="text-gray-600 text-sm">Control categories, reminder times, opt out anytime</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2" style={{ color: '#3D352E' }}>Contact Discovery</h3>
                  <p className="text-gray-600 text-sm">Skip contacts access; no matching without consent</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2" style={{ color: '#3D352E' }}>Account Control</h3>
                  <p className="text-gray-600 text-sm">Access, update, or delete your account in Settings</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2" style={{ color: '#3D352E' }}>Data Requests</h3>
                  <p className="text-gray-600 text-sm">Contact us for data access or deletion requests</p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D352E' }}>Children's Privacy</h2>
              <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-yellow-900">
                  The App is not directed to children under 13. We do not knowingly collect personal information from children under 13.
                  If you believe a child provided us personal data, contact us to delete it.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section id="international" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Globe className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                International Transfers
              </h2>
              <p className="text-gray-700">
                Your information may be processed and stored in the United States or other countries where our providers operate.
                We rely on contractual and technical safeguards to protect your information.
              </p>
            </section>

            {/* Security */}
            <section className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D352E' }}>Security</h2>
              <p className="text-gray-700">
                We implement administrative, technical, and physical measures to protect your information.
                No method of transmission or storage is completely secure.
              </p>
            </section>

            {/* Changes */}
            <section className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D352E' }}>Changes to this Policy</h2>
              <p className="text-gray-700">
                We may update this Policy from time to time. We will update the "Last updated" date above and,
                where appropriate, provide additional notice.
              </p>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#3D352E' }}>
                <Mail className="w-6 h-6 mr-2" style={{ color: '#c71c39' }} />
                Contact Us
              </h2>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-700 mb-4">If you have questions or requests about this Policy, please contact:</p>
                <div className="space-y-2">
                  <p className="font-semibold" style={{ color: '#3D352E' }}>BiteClub</p>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Mail className="w-4 h-4" style={{ color: '#c71c39' }} />
                    <a href="mailto:wejarrard@gmail.com" className="hover:text-gray-900 transition-colors">wejarrard@gmail.com</a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Phone className="w-4 h-4" style={{ color: '#c71c39' }} />
                    <a href="tel:+16087728104" className="hover:text-gray-900 transition-colors">+1 (608) 772-8104</a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-12 lg:px-12 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/icon.png"
              alt="BiteClub"
              width={32}
              height={32}
              className="rounded-lg shadow-md"
            />
            <span className="font-bold" style={{ color: '#3D352E' }}>BiteClub</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Your cooking identity. Your community.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a>
            <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a>
          </div>
          <p className="text-gray-500 text-xs mt-6">© 2024 BiteClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
