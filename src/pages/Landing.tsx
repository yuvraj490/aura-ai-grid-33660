import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Sparkles, Zap, Users, Shield, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Multi-Model Comparison',
      description: 'Compare responses from multiple AI models side-by-side in real-time.',
    },
    {
      icon: Users,
      title: 'AI Avatars',
      description: 'Chat with historical figures and visionaries - Gandhi, Einstein, and more.',
    },
    {
      icon: Shield,
      title: 'Auto-AI Routing',
      description: 'Automatically routes your prompt to the best-performing model.',
    },
    {
      icon: Sparkles,
      title: 'Premium Models',
      description: 'Access to LLaMA 4, GPT-OSS, Kimi, and 15+ cutting-edge AI models.',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: ['10 prompts per day', 'Access to 3 models', 'Basic avatars', 'Standard support'],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Premium',
      price: '₹499',
      period: 'per month',
      features: ['Unlimited prompts', 'All 15+ models', 'Custom avatars', 'Priority support', 'Advanced analytics'],
      cta: 'Upgrade Now',
      popular: true,
    },
    {
      name: 'Annual',
      price: '₹4,999',
      period: 'per year',
      features: ['Everything in Premium', '2 months free', 'Early access to new models', 'Dedicated support'],
      cta: 'Best Value',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-sm text-primary font-medium">✨ 15+ AI Models in One Place</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Ultimate
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Multi-AI Experience
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Compare AI models, chat with legendary avatars, and get the best responses—all in one premium platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 shadow-glow">
                  Try for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/avatars">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Explore Avatars
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for the perfect AI experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative ${
                  plan.popular
                    ? 'border-primary shadow-glow bg-card/80'
                    : 'border-border/50 bg-card/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/billing">
                  <Button
                    className={`w-full ${
                      plan.popular ? 'bg-gradient-primary' : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Multi-AI?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users already using Multi-AI Hub for smarter conversations.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 shadow-glow">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-6">What is Multi-AI Hub by YuvrajBold?</h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Multi-AI Hub is the ultimate AI chat platform created by YuvrajBold that lets you chat with multiple AI models and realistic AI avatars all in one place. Whether you want to compare responses from different AI models like Gemini 2.5 Pro, GPT-5, or have a philosophical conversation with Gandhi Ji's AI avatar, Multi-AI Hub makes it possible.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">Why Choose Multi-AI Hub?</h2>
            
            <p className="text-muted-foreground mb-4">
              Unlike other AI chat platforms, Multi-AI Hub by YuvrajBold offers a unique multi-AI experience. You can chat with historical figures like Albert Einstein AI chatbot, get business advice from the Elon Musk AI chatbot, or seek wisdom from the Gandhi Ji AI bot. Our platform integrates multiple AI models including Google's Gemini AI and OpenAI's GPT-5 series, giving you access to the best AI responses available.
            </p>

            <h3 className="text-xl font-bold mb-4 mt-6">Chat with AI Avatars and Personalities</h3>
            
            <p className="text-muted-foreground mb-4">
              Experience conversations with legendary personalities brought to life through advanced AI:
            </p>

            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li><strong>Gandhi Ji AI Bot</strong> - Get spiritual guidance and wisdom from Mahatma Gandhi's AI avatar</li>
              <li><strong>Albert Einstein AI Chat</strong> - Discuss physics, mathematics, and philosophy with Einstein's AI persona</li>
              <li><strong>Elon Musk AI Chatbot</strong> - Talk technology, innovation, and entrepreneurship with Elon's AI character</li>
            </ul>

            <h3 className="text-xl font-bold mb-4 mt-6">Multiple AI Models in One Platform</h3>
            
            <p className="text-muted-foreground mb-4">
              Multi-AI Hub integrates cutting-edge AI models to give you the best responses:
            </p>

            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li><strong>Google Gemini 2.5 Pro</strong> - Advanced reasoning and multimodal capabilities</li>
              <li><strong>Google Gemini 2.5 Flash</strong> - Fast, efficient AI responses</li>
              <li><strong>OpenAI GPT-5</strong> - Powerful language understanding and generation</li>
              <li><strong>GPT-5 Mini & Nano</strong> - Optimized for speed and efficiency</li>
            </ul>

            <h3 className="text-xl font-bold mb-4 mt-6">Features That Make Us Different</h3>
            
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li><strong>Auto AI Routing</strong> - Our smart system automatically selects the best AI model for your query</li>
              <li><strong>Side-by-Side Comparison</strong> - Compare responses from different AI models in real-time</li>
              <li><strong>Realistic AI Character Chat</strong> - Talk to famous personalities with personality-matched responses</li>
              <li><strong>Free and Premium Plans</strong> - Start free with 10 daily prompts or upgrade for unlimited access</li>
              <li><strong>Secure and Private</strong> - Your conversations are encrypted and secure</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">Who is Multi-AI Hub For?</h2>
            
            <p className="text-muted-foreground mb-4">
              Multi-AI Hub by YuvrajBold is perfect for:
            </p>

            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li><strong>Students and Researchers</strong> - Get help with complex topics from AI experts</li>
              <li><strong>Content Creators</strong> - Generate ideas and get creative assistance</li>
              <li><strong>Entrepreneurs</strong> - Brainstorm with AI avatars of successful innovators</li>
              <li><strong>AI Enthusiasts</strong> - Compare and explore different AI models</li>
              <li><strong>Anyone Curious</strong> - Have meaningful conversations with historical figures</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">Start Your Multi-AI Journey Today</h2>
            
            <p className="text-muted-foreground mb-6">
              Join thousands of users already experiencing the future of AI chat with Multi-AI Hub by YuvrajBold. Whether you want to chat with AI avatars, compare multiple AI models, or simply get the best AI responses for your questions, Multi-AI Hub is your all-in-one AI assistant platform.
            </p>

            <p className="text-muted-foreground mb-4">
              Sign up now for free and get 10 prompts per day to chat with Gandhi Ji AI, Einstein AI, or any of our advanced AI models. Upgrade to Premium for unlimited access to all 15+ AI models and custom avatar creation.
            </p>

            <h3 className="text-xl font-bold mb-4 mt-6">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Can I really chat with Gandhi Ji or Einstein?</h4>
                <p className="text-muted-foreground">Yes! Our AI avatars are trained to respond in the style and personality of these legendary figures, providing an educational and engaging experience.</p>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">What AI models does Multi-AI Hub support?</h4>
                <p className="text-muted-foreground">We support 15+ AI models including Google Gemini 2.5 Pro, GPT-5, GPT-5 Mini, Gemini Flash, and many more cutting-edge models.</p>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Is Multi-AI Hub free to use?</h4>
                <p className="text-muted-foreground">Yes! We offer a free plan with 10 prompts per day. Premium plans start at ₹499/month for unlimited access.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Multi-AI Hub by YuvrajBold – All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Chat with multiple AI models | AI avatar conversations | Gandhi Ji AI | Einstein AI | Elon Musk AI | Gemini AI | GPT-5 AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
