import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Bell, Mail, RefreshCw, ChevronRight, BookOpen } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const sections = [
  {
    id: 'information-we-collect',
    icon: Database,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you create an account, make a purchase, or contact us, we collect information such as your name, email address, phone number, billing address, and payment details (processed securely via Stripe — we never store raw card data).'
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform — including pages visited, books viewed, reading progress, search queries, device type, browser, and IP address — to improve your experience.'
      },
      {
        subtitle: 'Cookies & Tracking',
        text: 'We use cookies and similar technologies to keep you logged in, remember your preferences, and analyze site traffic. You can control cookie settings through your browser at any time.'
      }
    ]
  },
  {
    id: 'how-we-use',
    icon: Eye,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Providing Our Services',
        text: 'Your information is used to process orders, deliver digital content (ebooks, audiobooks), manage your library, send order confirmations, and provide customer support.'
      },
      {
        subtitle: 'Personalization',
        text: 'We use your reading history and preferences to recommend books you might love and personalize your browsing experience across the platform.'
      },
      {
        subtitle: 'Communications',
        text: 'With your consent, we may send you newsletters, promotional offers, and updates about new arrivals. You can unsubscribe anytime via the link in any email we send.'
      }
    ]
  },
  {
    id: 'data-sharing',
    icon: Lock,
    title: 'Data Sharing & Disclosure',
    content: [
      {
        subtitle: 'We Never Sell Your Data',
        text: 'Pustak Maza does not sell, rent, or trade your personal information to third parties for their marketing purposes. Your data is yours.'
      },
      {
        subtitle: 'Service Providers',
        text: 'We share data with trusted service providers who help us operate our platform — including Stripe (payments), cloud hosting partners, and analytics providers — under strict data processing agreements.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information when required by law, court order, or to protect the rights, property, or safety of Pustak Maza, our users, or the public.'
      }
    ]
  },
  {
    id: 'data-security',
    icon: Shield,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Encryption & Protection',
        text: 'All data transmitted between your browser and our servers is encrypted using TLS/HTTPS. Passwords are hashed using industry-standard bcrypt. We never store plaintext passwords.'
      },
      {
        subtitle: 'Payment Security',
        text: 'All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment processor. We do not store your credit card numbers on our servers.'
      },
      {
        subtitle: 'Data Breach Response',
        text: 'In the unlikely event of a data breach affecting your personal information, we will notify you via email within 72 hours, as required by applicable data protection regulations.'
      }
    ]
  },
  {
    id: 'your-rights',
    icon: RefreshCw,
    title: 'Your Rights & Choices',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You have the right to access all personal data we hold about you and request a copy in a portable format. Visit your Account Settings or contact us at privacy@pustakMaza.com.'
      },
      {
        subtitle: 'Correction & Deletion',
        text: 'You can update your profile information anytime. You may also request deletion of your account and associated data. Note that certain data may be retained for legal or legitimate business purposes.'
      },
      {
        subtitle: 'Opt-Out & Consent Withdrawal',
        text: 'You can opt out of marketing emails at any time, disable cookies via browser settings, or withdraw consent for data processing. This will not affect the lawfulness of processing before withdrawal.'
      }
    ]
  },
  {
    id: 'updates',
    icon: Bell,
    title: 'Policy Updates',
    content: [
      {
        subtitle: 'Changes to This Policy',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes via email or a prominent notice on our website before the changes become effective.'
      },
      {
        subtitle: 'Continued Use',
        text: 'Your continued use of Pustak Maza after any changes to this policy constitutes your acceptance of the updated terms. We encourage you to review this page periodically.'
      }
    ]
  }
];

const PrivacyPolicy = () => {
  usePageMeta('Privacy Policy', 'Learn how Pustak Maza collects, uses, and protects your personal information.');

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#1e293b] via-primary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 rounded-full bg-primary-300 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 text-primary-200 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Shield size={13} />
            Legal & Privacy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight font-poppins leading-tight">
            Privacy Policy
          </h1>
          <p className="text-primary-100 text-sm sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            At Pustak Maza, your privacy matters. This policy explains how we collect, use, and protect your personal information when you use our platform.
          </p>
          <p className="text-primary-300 text-xs sm:text-sm mt-5 font-semibold">
            Last updated: March 23, 2025 &nbsp;·&nbsp; Effective: March 23, 2025
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8 mb-10 sm:mb-14">
          <h2 className="text-sm font-extrabold text-[#1e293b] uppercase tracking-widest mb-5 flex items-center gap-2">
            <BookOpen size={15} className="text-primary-500" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-3 text-sm text-[#64748b] hover:text-primary-600 hover:bg-primary-50 px-3 py-2.5 rounded-xl transition-all group"
              >
                <span className="w-6 h-6 rounded-lg bg-primary-50 text-primary-600 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  {i + 1}
                </span>
                <span className="font-semibold">{s.title}</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* Intro Commitment Box */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-2xl p-5 sm:p-8 mb-10 sm:mb-14 flex gap-4 sm:gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(106,13,173,0.35)]">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-primary-800 mb-2 font-poppins">Our Commitment to You</h3>
            <p className="text-primary-700 text-sm sm:text-base leading-relaxed">
              We are committed to being transparent about how we handle your data. We collect only what we need, protect it with strong security measures, and give you full control over your information. If you have any questions, reach us at{' '}
              <a href="mailto:privacy@pustakMaza.com" className="font-bold underline underline-offset-2 hover:text-primary-900">
                privacy@pustakMaza.com
              </a>
              .
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 sm:space-y-12">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden scroll-mt-24"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-[#f1f5f9] bg-gradient-to-r from-gray-50/80 to-white">
                  <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(106,13,173,0.35)] flex-shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-black text-primary-400 tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                    <h2 className="text-base sm:text-xl font-extrabold text-[#1e293b] font-poppins">{section.title}</h2>
                  </div>
                </div>

                {/* Content blocks */}
                <div className="divide-y divide-[#f1f5f9]">
                  {section.content.map((block, i) => (
                    <div key={i} className="px-5 sm:px-8 py-5 sm:py-6">
                      <h3 className="text-sm sm:text-base font-bold text-[#1e293b] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                        {block.subtitle}
                      </h3>
                      <p className="text-[#64748b] text-sm sm:text-base leading-relaxed pl-3.5">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact & Footer Card */}
        <div className="mt-12 sm:mt-16 bg-[#1e293b] rounded-2xl p-7 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_8px_25px_-4px_rgba(106,13,173,0.5)]">
              <Mail size={24} className="text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3 font-poppins">Questions About Your Privacy?</h3>
            <p className="text-[#94a3b8] text-sm sm:text-base mb-7 max-w-lg mx-auto leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, our privacy team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:privacy@pustakMaza.com"
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-7 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm"
              >
                Email Privacy Team
              </a>
              <Link
                to="/contact"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>
            <p className="text-[#475569] text-xs mt-7 font-medium">
              © {new Date().getFullYear()} Pustak Maza · All Rights Reserved ·
              <Link to="/terms" className="ml-1.5 hover:text-primary-400 transition-colors">Terms of Service</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
