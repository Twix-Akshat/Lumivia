"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  Users,
  Video,
  Lock,
  Calendar,
  MessageCircle,
  Star,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="text-white space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Your Mental Wellness Partner</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Therapy that fits
                <br />
                <span className="text-white/90">your life</span>
              </h1>

              <p className="text-xl text-white/80 max-w-xl">
                Connect with licensed therapists from the comfort of your home. Professional mental health support, whenever you need it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="
        w-full sm:w-auto 
        h-14 px-10 
        text-lg font-semibold 
        bg-primary text-primary-foreground
        hover:bg-primary/90
        shadow-xl hover:shadow-2xl
        transition-all duration-300
        rounded-xl
        group
      "
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="
        w-full sm:w-auto 
        h-14 px-10 
        text-lg font-semibold
        text-white
        bg-white/10
        border border-white/20
        hover:bg-white/20
        backdrop-blur-md
        rounded-xl
        transition-all duration-300
      "
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  { number: "10K+", label: "Active Users" },
                  { number: "500+", label: "Therapists" },
                  { number: "50K+", label: "Sessions" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="text-3xl font-bold">{stat.number}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Video,
                    title: "Video Sessions",
                    description: "HD quality calls",
                    color: "bg-blue-500/20",
                  },
                  {
                    icon: Calendar,
                    title: "Flexible Scheduling",
                    description: "Book anytime",
                    color: "bg-green-500/20",
                  },
                  {
                    icon: Lock,
                    title: "100% Private",
                    description: "HIPAA compliant",
                    color: "bg-purple-500/20",
                  },
                  {
                    icon: Heart,
                    title: "Personalized Care",
                    description: "Matched to you",
                    color: "bg-pink-500/20",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 animate-in fade-in zoom-in-50"
                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-4" variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              Why Choose Lumivia
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Everything you need for
              <br />
              <span className="text-primary">better mental health</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional therapy made accessible, affordable, and convenient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Licensed Professionals",
                description: "All therapists are licensed, vetted, and experienced in their field",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
              },
              {
                icon: Clock,
                title: "Available 24/7",
                description: "Book sessions that fit your schedule, day or night",
                color: "text-green-500",
                bgColor: "bg-green-500/10",
              },
              {
                icon: Lock,
                title: "Private & Secure",
                description: "HIPAA-compliant platform with end-to-end encryption",
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
              },
              {
                icon: Video,
                title: "HD Video Sessions",
                description: "Crystal clear video and audio for the best experience",
                color: "text-pink-500",
                bgColor: "bg-pink-500/10",
              },
              {
                icon: MessageCircle,
                title: "Private Journaling",
                description: "Track your thoughts and progress with secure journaling",
                color: "text-orange-500",
                bgColor: "bg-orange-500/10",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Monitor your mental health journey with insights",
                color: "text-cyan-500",
                bgColor: "bg-cyan-500/10",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-4" variant="secondary">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Simple Process
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Get started in
              <span className="text-primary"> 3 easy steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up in minutes and tell us about your needs and preferences",
                icon: Users,
              },
              {
                step: "02",
                title: "Find Your Therapist",
                description: "Browse profiles and choose a licensed therapist that's right for you",
                icon: Heart,
              },
              {
                step: "03",
                title: "Start Your Journey",
                description: "Book your first session and begin your path to better mental health",
                icon: Sparkles,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}

                <div className="relative bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mt-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge className="mb-4" variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Loved by thousands
              <br />
              <span className="text-primary">of users worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content: "Lumivia changed my life. Having access to therapy from home made all the difference in my recovery journey.",
                rating: 5,
              },
              {
                name: "Dr. Michael Chen",
                role: "Therapist",
                content: "As a therapist, this platform allows me to reach more people and provide quality care with excellent tools.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                content: "The flexibility to schedule sessions around my work has been incredible. My therapist is amazing!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-20 lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Award className="h-4 w-4" />
            <span className="text-sm font-medium">Start Your Journey Today</span>
          </div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Ready to prioritize your
            <br />
            mental health?
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join thousands of people who have taken the first step towards better mental wellness
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="
        w-full sm:w-auto 
        h-14 px-10 
        text-lg font-semibold 
        bg-primary text-primary-foreground
        hover:bg-primary/90
        shadow-xl hover:shadow-2xl
        transition-all duration-300
        rounded-xl
        group
      "
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/auth/login">
              <Button
                size="lg"
                variant="ghost"
                className="
        w-full sm:w-auto 
        h-14 px-10 
        text-lg font-semibold
        text-white
        bg-white/10
        border border-white/20
        hover:bg-white/20
        backdrop-blur-md
        rounded-xl
        transition-all duration-300
      "
              >
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/60 pt-4">
            No credit card required • Cancel anytime • HIPAA compliant
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary p-1.5">
                  <img
                    src="/lumivia_logo.png"
                    alt="Lumivia"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-bold text-xl">Lumivia</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional mental health support, whenever you need it.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Therapists</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">How it works</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">HIPAA</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Lumivia. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
