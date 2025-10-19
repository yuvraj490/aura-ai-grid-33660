import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Search, Sparkles, Plus } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  title: string;
  description: string;
  quote: string;
  category: string;
  premium?: boolean;
}

const AVATARS: Avatar[] = [
  {
    id: 'gandhi',
    name: 'Mahatma Gandhi',
    title: 'Father of the Nation',
    description: 'Indian independence leader who advocated non-violent civil disobedience.',
    quote: 'Be the change you wish to see in the world.',
    category: 'Historical Leaders',
  },
  {
    id: 'bhagat-singh',
    name: 'Bhagat Singh',
    title: 'Revolutionary Freedom Fighter',
    description: 'Indian socialist revolutionary who fought against British colonial rule.',
    quote: 'They may kill me, but they cannot kill my ideas.',
    category: 'Historical Leaders',
  },
  {
    id: 'apj-kalam',
    name: 'A.P.J. Abdul Kalam',
    title: 'Missile Man of India',
    description: 'Indian aerospace scientist and 11th President of India.',
    quote: 'Dream is not what you see in sleep, it is the thing which does not let you sleep.',
    category: 'Scientists',
  },
  {
    id: 'rani-laxmibai',
    name: 'Rani Laxmibai',
    title: 'Queen of Jhansi',
    description: 'Leading figure of the Indian Rebellion of 1857 against British rule.',
    quote: 'I shall not surrender my Jhansi.',
    category: 'Historical Leaders',
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    title: 'Theoretical Physicist',
    description: 'Developed the theory of relativity, one of the two pillars of modern physics.',
    quote: 'Imagination is more important than knowledge.',
    category: 'Scientists',
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    title: 'Entrepreneur & Innovator',
    description: 'CEO of Tesla and SpaceX, advancing sustainable energy and space exploration.',
    quote: 'When something is important enough, you do it even if the odds are not in your favor.',
    category: 'Entrepreneurs',
    premium: true,
  },
  {
    id: 'nehru',
    name: 'Jawaharlal Nehru',
    title: 'First Prime Minister of India',
    description: 'Central figure in Indian politics before and after independence.',
    quote: 'The only alternative to coexistence is co-destruction.',
    category: 'Historical Leaders',
  },
  {
    id: 'bose',
    name: 'Subhash Chandra Bose',
    title: 'Netaji',
    description: 'Indian nationalist whose defiance of British authority made him a hero.',
    quote: 'Give me blood, and I shall give you freedom!',
    category: 'Historical Leaders',
  },
];

export default function Avatars() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const categories = ['all', ...Array.from(new Set(AVATARS.map(a => a.category)))];
  
  const filteredAvatars = AVATARS.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          avatar.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || avatar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartChat = (avatar: Avatar) => {
    if (avatar.premium && user?.plan === 'free') {
      navigate('/billing');
      return;
    }
    // Navigate to dashboard with avatar context and flag to create new chat
    navigate('/dashboard', { state: { avatar, createNewChat: true } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Chat with Legends</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">AI Avatars</h1>
            <p className="text-xl text-muted-foreground">
              Converse with the minds of history's greatest leaders, scientists, and visionaries
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search avatars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatars Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredAvatars.map((avatar, index) => (
              <Card
                key={avatar.id}
                className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar Icon */}
                <div className="h-20 w-20 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                  {avatar.name.charAt(0)}
                </div>

                {/* Content */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">{avatar.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{avatar.title}</p>
                  
                  <div className="flex justify-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {avatar.category}
                    </Badge>
                    {avatar.premium && (
                      <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                        Premium
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {avatar.description}
                  </p>

                  <blockquote className="text-sm italic text-primary/80 border-l-2 border-primary/30 pl-3 py-1">
                    "{avatar.quote}"
                  </blockquote>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleStartChat(avatar)}
                  className="w-full"
                  variant={avatar.premium && user?.plan === 'free' ? 'outline' : 'default'}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {avatar.premium && user?.plan === 'free' ? 'Upgrade to Chat' : 'Start Chat'}
                </Button>
              </Card>
            ))}
          </div>

          {/* Create Custom Avatar CTA */}
          <Card className="max-w-4xl mx-auto mt-12 p-8 text-center border-primary/30 bg-primary/5">
            <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Create Custom Avatar</h3>
            <p className="text-muted-foreground mb-6">
              Design your own AI personality with unique traits, tone, and expertise
            </p>
            <Button size="lg" className="bg-gradient-primary">
              Coming Soon
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
