import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Clock, 
  Star, 
  CheckCircle, 
  Globe, 
  Lightbulb,
  MessageCircle,
  BarChart3,
  Shield,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

const InstructorLanding = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Research', href: '#research' },
    { name: 'Consulting', href: '#consulting' },
    { name: 'Training', href: '#training' },
    { name: 'Insights', href: '#insights' },
    { name: 'Careers', href: '#careers' }
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Reach a Global Audience",
      description: "Connect with students worldwide and share your expertise with learners across different continents."
    },
    {
      icon: DollarSign,
      title: "Passive Income Opportunities",
      description: "Create courses once and earn continuously as students enroll in your content."
    },
    {
      icon: Lightbulb,
      title: "No Tech Experience Needed",
      description: "Our intuitive platform makes it easy to create and publish courses without technical skills."
    },
    {
      icon: Shield,
      title: "Full Control Over Content",
      description: "Maintain complete ownership and control over your course materials and pricing."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your instructor account and complete the quick verification process."
    },
    {
      number: "02", 
      title: "Create Your Course",
      description: "Use our easy-to-use tools to build engaging video courses and assessments."
    },
    {
      number: "03",
      title: "Publish and Earn",
      description: "Launch your course and start earning as students enroll and learn from you."
    }
  ];

  const features = [
    "Advanced video uploader with chunked processing",
    "Interactive course builder",
    "Student analytics and progress tracking",
    "Automated certificate generation",
    "Live session hosting capabilities",
    "Direct messaging with students"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Development Instructor",
      content: "I've been able to reach over 5,000 students and generate consistent passive income while doing what I love - teaching.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Data Science Expert",
      content: "The platform is incredibly user-friendly. I had my first course published within a week of signing up.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Business Strategy Consultant",
      content: "The student engagement tools and analytics help me continuously improve my courses and teaching methods.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Do I retain ownership of my content?",
      answer: "Yes, you maintain full intellectual property rights to all course content you create."
    },
    {
      question: "How much can I earn as an instructor?",
      answer: "Earnings vary based on course pricing, enrollment numbers, and engagement. Top instructors earn thousands monthly."
    },
    {
      question: "How long does it take to publish a course?",
      answer: "Most instructors can create and publish their first course within 1-2 weeks using our guided process."
    },
    {
      question: "What support do you provide to new instructors?",
      answer: "We offer comprehensive onboarding, dedicated support team, and an active instructor community."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/feba2167-456e-4e3d-b943-30361d3be552.png" 
                alt="Trizen Logo" 
                className="h-12 sm:h-20 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-[#3F2B96] transition-colors font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            
            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-700"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/instructor-signup')}
                className="bg-[#3F2B96] hover:bg-[#5b44ad]"
              >
                Start Teaching
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden bg-white border-t border-gray-100">
              <nav className="px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-[#3F2B96] transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="w-full justify-start text-gray-700"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/instructor-signup')}
                    className="w-full bg-[#3F2B96] hover:bg-[#5b44ad]"
                  >
                    Start Teaching
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#3F2B96] to-[#5b44ad] text-white py-3 sm:py-4 lg:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Teach the World<br />
                <span className="text-blue-200 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Earn on Your Terms.</span>
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join thousands of educators creating impactful online courses and building sustainable income streams through teaching.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate('/instructor-signup')}
                  className="bg-white text-[#3F2B96] hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Start Teaching Today
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#3F2B96] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold transition-all duration-200"
                >
                  Login
                </Button>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <img 
                  src="/lovable-uploads/0e655f42-e700-4cb1-a43c-aa20a2367714.png" 
                  alt="Confident teacher ready to teach online" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Trizen for Teaching?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join a platform designed to help educators succeed and make a meaningful impact
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#3F2B96] text-white rounded-full mb-4 sm:mb-6">
                    <benefit.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#3F2B96] text-white rounded-full text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg sm:text-xl text-gray-600">Hear from instructors who are making an impact</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Powerful Tools for Modern Educators
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Everything you need to create, manage, and grow your online teaching business.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-gray-100 rounded-2xl p-6 sm:p-8 text-center">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-[#3F2B96] mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-gray-600">Analytics</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[#3F2B96] mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-gray-600">Messaging</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#3F2B96] mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-gray-600">Courses</div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Intuitive instructor dashboard with comprehensive tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#3F2B96] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent Revenue Model</h2>
            <p className="text-lg sm:text-xl text-blue-100">Keep more of what you earn with our competitive revenue split</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center lg:text-left">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">70%</div>
                <div className="text-lg sm:text-xl">You Keep</div>
                <div className="text-blue-200">Of every course sale</div>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Monthly payouts via bank transfer</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-sm sm:text-base">No hidden fees or charges</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Set your own course pricing</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Potential Monthly Earnings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/20">
                  <span className="text-sm sm:text-base">100 students × $50 course</span>
                  <span className="font-bold text-sm sm:text-base">$3,500</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/20">
                  <span className="text-sm sm:text-base">300 students × $80 course</span>
                  <span className="font-bold text-sm sm:text-base">$16,800</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3">
                  <span className="text-sm sm:text-base">500 students × $120 course</span>
                  <span className="font-bold text-sm sm:text-base">$42,000</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-3 sm:mt-4">*Earnings calculated at 70% revenue share</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-600">Get answers to common questions about becoming an instructor</p>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{faq.question}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Ready to Start Teaching?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Join thousands of educators who are already making an impact and earning through teaching
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/instructor-signup')}
              className="bg-[#3F2B96] hover:bg-[#5b44ad] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Teaching Today
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-[#3F2B96] text-[#3F2B96] hover:bg-[#3F2B96] hover:text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold transition-all duration-200"
            >
              Already have an account? Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <img 
                src="/lovable-uploads/feba2167-456e-4e3d-b943-30361d3be552.png" 
                alt="Trizen Logo" 
                className="h-6 sm:h-8 w-auto mb-3 sm:mb-4 filter brightness-0 invert"
              />
              <p className="text-sm sm:text-base text-gray-400">
                Empowering educators to share knowledge and build successful online teaching businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Instructors</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>Getting Started</li>
                <li>Course Creation</li>
                <li>Marketing Tools</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Guidelines</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2025 Trizen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InstructorLanding;
