import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function ContactPage() {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do you collect discarded temple flowers?',
      a: 'We have dedicated morning collection routes partnering with registered temple trusts, flower mandis, and event organisers. Flowers are collected in breathable crates to prevent mildew.',
    },
    {
      q: 'Are your flower-derived products safe for skin and home use?',
      a: 'Yes. All flowers undergo clean sun-drying and hygienic steam treatment. We do not use chemical fixatives, artificial fragrances, or toxic preservatives.',
    },
    {
      q: 'How does the clothing donation pickup work?',
      a: 'After you submit your pickup request online, our logistics coordinator reviews slot availability and contacts you via phone or SMS to confirm the pickup timing.',
    },
    {
      q: 'Can I partner with BLOOMORA as an institution or wedding planner?',
      a: 'Absolutely. We provide zero-waste event partnerships where we manage all floral decors post-event and transform them into personalized keepsake gifts for your guests.',
    },
    {
      q: 'What is your shipping and return policy?',
      a: 'We ship pan-India within 3-5 business days. In case of any transit damage, we offer full replacements or refunds within 7 days of delivery.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success('Message sent! Our customer care team will respond within 24 hours.');
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Get in Touch</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">We’d Love to Hear From You</h1>
        <p className="text-sm text-charcoal/70 font-sans">
          Have a question about an order, institutional flower collection, or clothing donation drive? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-forest mb-2">Send a Message</h2>
          <p className="text-xs text-charcoal/60 mb-6 font-sans">Our support desk is active Monday through Saturday.</p>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-sage/15 border border-sage/30 text-center space-y-3">
              <p className="font-serif text-xl font-bold text-forest">Thank You for Connecting</p>
              <p className="text-xs text-charcoal/70 max-w-sm mx-auto">
                We have received your message and will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-6 py-2 rounded-full bg-forest text-ivory text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Radhika Menon"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-medium"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order & Shipping">Order & Shipping</option>
                    <option value="Flower Waste Collection">Flower Waste Collection</option>
                    <option value="Clothing Donation">Clothing Donation</option>
                    <option value="Corporate / Event Gifting">Corporate / Event Gifting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-forest text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-xl font-bold text-forest">Connect Directly</h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 text-forest flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Electronic Mail</p>
                  <a href="mailto:support@bloomora.in" className="text-forest hover:underline">
                    support@bloomora.in
                  </a>
                  <p className="text-charcoal/50 text-[11px]">For inquiries & partnerships</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 text-forest flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Helpline</p>
                  <p className="text-charcoal/70">+91 (080) 4123-BLOOM</p>
                  <p className="text-charcoal/50 text-[11px]">Mon - Sat: 9:30 AM to 6:30 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 text-forest flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Artisanal Studio & Workshop</p>
                  <p className="text-charcoal/70 leading-relaxed">
                    BLOOMORA Sustainability Hub, Indiranagar, Bengaluru, Karnataka - 560038
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Answers</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-beige overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif text-sm sm:text-base font-semibold text-forest hover:bg-ivory/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sage shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-charcoal/40 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-charcoal/70 font-sans leading-relaxed border-t border-beige/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
