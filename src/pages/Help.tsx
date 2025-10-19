import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Send, HelpCircle, Book, MessageCircle } from 'lucide-react';

export default function Help() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: 'How do I start using Multi-AI Hub?',
      answer: 'Simply sign up for a free account to get started. You\'ll receive 10 prompts per day with the free plan. From the dashboard, you can type your question and our AI will respond instantly. You can also compare multiple models or chat with AI avatars.',
    },
    {
      question: 'What is Auto-AI mode?',
      answer: 'Auto-AI automatically selects the best AI model for your prompt based on factors like response quality, latency, and prompt type. This ensures you always get the most accurate and fastest response possible.',
    },
    {
      question: 'How do AI Avatars work?',
      answer: 'AI Avatars are specialized AI personalities modeled after historical figures and visionaries. Each avatar has unique traits, vocabulary, and style matching their real-world counterpart. You can have conversations as if you\'re speaking with Gandhi, Einstein, or other legends.',
    },
    {
      question: 'What happens when I hit my daily limit?',
      answer: 'Free users get 10 prompts per day. Once you reach your limit, you\'ll need to wait until midnight for a reset, or upgrade to Premium for unlimited prompts.',
    },
    {
      question: 'Can I export my chat history?',
      answer: 'Yes! Premium users can export their entire chat history as a JSON file from the Settings page. This includes all conversations, timestamps, and model information.',
    },
    {
      question: 'Which AI models are available?',
      answer: 'We offer 15+ cutting-edge models including LLaMA 3.3 70B, LLaMA 4 variants, GPT-OSS, Kimi K2, Qwen 3, and more. Each model has different strengths for various tasks.',
    },
    {
      question: 'How does billing work?',
      answer: 'We offer three plans: Free (₹0, 10 prompts/day), Premium (₹499/month, unlimited), and Annual (₹4,999/year with 2 months free). You can upgrade or cancel anytime.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All conversations are stored locally in your browser. We don\'t send your data to external servers except for AI model APIs. You can export or delete your data anytime.',
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending email to admin
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO_BACKEND: Send actual email to ys8800221@gmail.com
    console.log('Support email sent to ys8800221@gmail.com:', { name, email, message });

    toast({
      title: 'Message sent!',
      description: 'We\'ll get back to you as soon as possible.',
    });

    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Help Center</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-xl text-muted-foreground">
              Find answers, learn features, or contact support
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Search FAQs */}
            <Card className="p-6 border-border/50 bg-card/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 text-lg h-14"
                />
              </div>
            </Card>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all cursor-pointer">
                <Book className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Complete guides and tutorials
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all cursor-pointer">
                <MessageCircle className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join our Discord community
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all cursor-pointer">
                <HelpCircle className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Status</h3>
                <p className="text-sm text-muted-foreground">
                  Check system status
                </p>
              </Card>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <Card className="border-border/50 bg-card/50 overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                        <span className="text-left font-semibold">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>

              {filteredFaqs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No results found for "{searchQuery}". Try a different search term.
                </p>
              )}
            </div>

            {/* Contact Support */}
            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Send us a message and we'll help you out.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="bg-background/50"
                    placeholder="Describe your issue or question..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-gradient-primary"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4">
                Messages are sent to: ys8800221@gmail.com
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
