import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Target, Calendar, TrendingUp, BookOpen, Palette, Star, Zap, Shield, ArrowRight, Sparkles, Users, Award } from 'lucide-react';
import clndr from '../images/clndr.png';
import t1 from '../images/t1.png';
import goal from '../images/goal.png';
import d2 from '../images/d2.png';
import p1 from '../images/p1.png';
import t from '../images/t.png';

const Landing = () => {
  
  const { user } = useAuth();
  
  const features = [
    {
      icon: <CheckSquare className="w-7 h-7" />,
      title: 'Smart Task Management',
      description: 'Organize your tasks with intelligent prioritization and deadline tracking',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      image: t1,
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: 'Goal Achievement',
      description: 'Set meaningful goals and track your progress with visual milestones',
      color: 'bg-green-50 text-green-600 border-green-100',
      image: goal,
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: 'Interactive Calendar',
      description: 'Beautiful calendar view with drag-and-drop scheduling',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      image: clndr,
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: 'Progress Analytics',
      description: 'Detailed insights and charts to track your productivity trends',
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      image: p1,
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: 'Daily Journal',
      description: 'Capture thoughts, reflections, and memories in your personal diary',
      color: 'bg-pink-50 text-pink-600 border-pink-100',
      image: d2,
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: 'Beautiful Themes',
      description: 'Customize your workspace with elegant themes and layouts',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      image: t,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&h=1080&fit=crop&crop=center)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/70 dark:bg-black/60"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Plan Your Perfect
            <span className="block text-blue-600">Daily Routine</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Transform your productivity with our beautifully designed daily planner. 
            Organize tasks, achieve goals, and build lasting habits.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="px-10 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-10 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
                
                <Link
                  to="/login"
                  className="px-10 py-4 bg-white/90 text-gray-700 border-2 border-gray-300 rounded-xl text-lg font-semibold hover:bg-white hover:border-blue-600 transition-all duration-300 shadow-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Everything you need to stay
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                organized and productive
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to help you manage your daily routine effortlessly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Feature Image */}
                <div className={`mb-6 rounded-2xl overflow-hidden ${
                  feature.title === 'Interactive Calendar' || feature.title === 'Progress Analytics' || feature.title === 'Daily Journal'
                    ? 'bg-white'
                    : 'bg-gray-100'
                }`}>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className={`w-full h-48 group-hover:scale-105 transition-transform duration-300 ${
                      feature.title === 'Interactive Calendar' || feature.title === 'Progress Analytics' || feature.title === 'Daily Journal'
                        ? 'object-contain'
                        : 'object-cover'
                    }`}
                  />
                </div>

                <div className={`inline-flex p-4 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Loved by productivity enthusiasts
            </h2>
            <p className="text-xl text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face" 
                  alt="Sarah Johnson"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"This app completely transformed how I organize my daily tasks. The interface is beautiful and intuitive!"</p>
              <div className="flex text-yellow-500 mt-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" 
                  alt="Mike Chen"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Mike Chen</h4>
                  <p className="text-sm text-gray-600">Entrepreneur</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The goal tracking feature helped me achieve more in 3 months than I did all last year. Highly recommend!"</p>
              <div className="flex text-yellow-500 mt-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face" 
                  alt="Emma Davis"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Emma Davis</h4>
                  <p className="text-sm text-gray-600">Designer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Finally, a productivity app that's as beautiful as it is functional. The design is absolutely stunning!"</p>
              <div className="flex text-yellow-500 mt-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">2M+</div>
              <div className="text-gray-600">Tasks Completed</div>
            </div>
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to transform your daily routine?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have already improved their productivity and achieved their goals.
              </p>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Routine Master
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your beautiful daily planner for a more organized and productive life.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Routine Master. Made with ❤️ for productivity enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;