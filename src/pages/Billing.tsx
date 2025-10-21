import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, CreditCard, Sparkles } from 'lucide-react';

export default function Billing() {
  const { profile, isAuthenticated, refreshUser } = useSupabaseAuth();
  const user = profile;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [couponCode, setCouponCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'annual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        '10 prompts per day',
        'Access to 3 AI models',
        'Basic avatars',
        'Standard support',
        'Rate limited responses',
      ],
      current: user.plan === 'free',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹499',
      period: 'per month',
      features: [
        'Unlimited prompts',
        'All 15+ AI models',
        'All avatars',
        'Priority support',
        'Advanced analytics',
        'No rate limits',
        'Export chat history',
      ],
      popular: true,
      current: user.plan === 'premium',
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '₹4,999',
      period: 'per year',
      savings: 'Save ₹989',
      features: [
        'Everything in Premium',
        '2 months free',
        'Early access to new models',
        'Dedicated support',
        'Custom avatar creation',
        'API access (coming soon)',
        'Team collaboration (coming soon)',
      ],
      current: user.plan === 'premium',
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || !user) return;
    
    setSelectedPlan(planId as 'premium');
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: planId as 'free' | 'premium',
        prompts_limit: planId === 'free' ? 10 : 999999,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      await refreshUser();
      toast({
        title: 'Subscription updated!',
        description: `You are now on the ${planId} plan. Enjoy unlimited AI access!`,
      });
    }

    setIsProcessing(false);
    setSelectedPlan(null);
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'hub2025') {
      toast({
        title: 'Coupon applied!',
        description: 'You received 10% off your next payment.',
      });
      setCouponCode('');
    } else {
      toast({
        title: 'Invalid coupon',
        description: 'The coupon code you entered is not valid.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Current Plan: {user.plan.toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Unlock unlimited AI conversations and premium features
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`p-8 relative transition-all duration-300 ${
                  plan.popular
                    ? 'border-primary shadow-glow bg-card/80 scale-105'
                    : 'border-border/50 bg-card/50'
                } ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Best Value
                  </div>
                )}

                {plan.current && (
                  <Badge className="absolute top-4 right-4 bg-primary">
                    Current Plan
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      {plan.savings}
                    </Badge>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.current || (plan.id === 'free') || isProcessing}
                  className={`w-full ${
                    plan.popular ? 'bg-gradient-primary' : ''
                  }`}
                  variant={plan.popular ? 'default' : plan.current ? 'secondary' : 'outline'}
                >
                  {isProcessing && selectedPlan === plan.id
                    ? 'Processing...'
                    : plan.current
                    ? 'Current Plan'
                    : plan.id === 'free'
                    ? 'Free Forever'
                    : 'Upgrade Now'}
                </Button>
              </Card>
            ))}
          </div>

          {/* Coupon Section */}
          {user.plan === 'free' && (
            <Card className="max-w-2xl mx-auto p-6 border-border/50 bg-card/50 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Have a coupon code?</h3>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button onClick={applyCoupon} disabled={!couponCode}>
                  Apply
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Try: HUB2025 for 10% off
              </p>
            </Card>
          )}

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, UPI, and net banking (mock for demo purposes).
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  The Free plan is available forever with 10 prompts per day. No credit card required to start.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
