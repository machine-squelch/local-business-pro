import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { MapPin, Palette, Zap, Star, ArrowRight, Building2, Users, TrendingUp } from 'lucide-react'
import './App.css'

// Components
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import DesignStudio from './components/DesignStudio'

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            🚀 AI-Powered Local Business Design
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            LocalBrand Pro
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Hyper-local business design automation that understands your market, 
            your customers, and your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="gradient-border">
              <Button size="lg" className="gradient-border-inner px-8 py-6 text-lg">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/10">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10x</div>
              <div className="text-muted-foreground">Faster Design Creation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Automated Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Local Businesses Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The only design platform that truly understands local markets and automates 
              everything from demographics to seasonal trends.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Location Intelligence</CardTitle>
                <CardDescription>
                  Automatically incorporates local landmarks, demographics, and cultural elements into your designs.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <Building2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Industry Templates</CardTitle>
                <CardDescription>
                  Specialized templates for plumbers, electricians, restaurants, salons, and 50+ other industries.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Seasonal Automation</CardTitle>
                <CardDescription>
                  Auto-updates designs based on local weather, holidays, and seasonal business trends.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Review Integration</CardTitle>
                <CardDescription>
                  Automatically incorporates your best customer reviews into marketing materials.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Local SEO Optimization</CardTitle>
                <CardDescription>
                  Designs optimized for local search with proper schema markup and geo-targeting.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader>
                <Palette className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Adobe Express Integration</CardTitle>
                <CardDescription>
                  Powered by Adobe's world-class design tools with AI-enhanced local customization.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your business size and needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Single Location</CardTitle>
                <div className="text-3xl font-bold text-primary">$29<span className="text-lg text-muted-foreground">/month</span></div>
                <CardDescription>Perfect for single-location businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Unlimited designs</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Location intelligence</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Industry templates</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Review integration</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Basic support</li>
                </ul>
                <div className="gradient-border mt-6">
                  <Button className="w-full gradient-border-inner">Get Started</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-primary/50 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              <CardHeader>
                <CardTitle>Multi-Location</CardTitle>
                <div className="text-3xl font-bold text-primary">$99<span className="text-lg text-muted-foreground">/month</span></div>
                <CardDescription>For businesses with 2-10 locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Everything in Single Location</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Multi-location management</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Advanced analytics</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Priority support</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Team collaboration</li>
                </ul>
                <div className="gradient-border mt-6">
                  <Button className="w-full gradient-border-inner">Get Started</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Agency License</CardTitle>
                <div className="text-3xl font-bold text-primary">$199<span className="text-lg text-muted-foreground">/month</span></div>
                <CardDescription>White-label for marketing agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Everything in Multi-Location</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> White-label branding</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Client management</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Revenue sharing</li>
                  <li className="flex items-center"><span className="text-primary mr-2">✓</span> Dedicated support</li>
                </ul>
                <div className="gradient-border mt-6">
                  <Button className="w-full gradient-border-inner">Contact Sales</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Local Marketing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of local businesses already using LocalBrand Pro to create 
            professional designs that connect with their community.
          </p>
          <div className="gradient-border inline-block">
            <Button size="lg" className="gradient-border-inner px-12 py-6 text-lg">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/design" element={<DesignStudio />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

