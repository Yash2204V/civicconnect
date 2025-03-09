import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Share2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Send,
  MapPin,
  Plus,
  Upload,
  Vote,
  UserCircle,
  ChevronDown,
  X,
  Camera,
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw,
  Heart,
  ThumbsUp,
  Eye,
  ArrowRight,
  Zap,
  BarChart2,
  Users,
  Shield,
  Menu,
  Home,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  status: 'posted' | 'waitlist' | 'in_progress' | 'completed';
  votes: string[];
  category: string;
  location: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
  comments: Comment[];
}

const categories = [
  'Violent Crimes',
  'Property Crimes',
  'Cyber Crimes',
  'Financial & White-Collar Crimes',
  'Drug-Related Crimes',
  'Sexual Crimes',
  'Public Safety & Order Violations',
  'Traffic & Transportation Violations',
  'Environmental Crimes',
  'Terrorism & National Security'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { posts, loading, error, fetchPosts, addComment, votePost, createPost } = usePosts();
  const [filter, setFilter] = useState('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(user?._id || 'user-' + Math.floor(Math.random() * 1000));
  const [userName, setUserName] = useState(user?.name || 'Community Member');
  const [voteAnimation, setVoteAnimation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('votes');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeView, setActiveView] = useState('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would normally be converted to an address using a geocoding service
          const { latitude, longitude } = position.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              setLocation(data.display_name);
            })
            .catch(error => {
              console.error("Error fetching location name:", error);
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set a default location if geolocation fails
          setLocation("Unknown location");
        }
      );
    } else {
      // Geolocation not supported by browser
      setLocation("Unknown location");
    }
  }, []);


  useEffect(() => {
    // Get user's location when creating a new post
    if (showNewPost && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would normally be converted to an address using a geocoding service
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              setLocation(data.display_name);
            })
            .catch(error => {
              console.error("Error fetching location name:", error);
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);



  useEffect(() => {
    if (user) {
      setUserId(user._id);
      setUserName(user.name);
    }
  }, [user]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();

    // Hide intro after 5 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVote = async (postId: string) => {
    // Set animation for the voted post
    setVoteAnimation(postId);
    setTimeout(() => setVoteAnimation(null), 1000);

    // Call the votePost function from context
    await votePost(postId);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    if (!isAuthenticated) {
      alert("Please log in to report an issue");
      return;
    }

    setUploading(true);
    try {
      // Determine media type from file
      let mediaType = 'image';
      if (media && media.type.startsWith('video/')) {
        mediaType = 'video';
      }

      // Create a new post using the context function
      await createPost({
        title,
        description,
        media: media || undefined,
        mediaType: mediaType as 'image' | 'video',
        category,
        location: location || 'Unknown location'
      });

      // Reset form
      setTitle('');
      setDescription('');
      setMedia(null);
      setPreviewUrl(null);
      setCategory('');
      setShowNewPost(false);

      // Refresh posts to show the newly created post
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentText[postId]?.trim()) return;

    if (!isAuthenticated) {
      alert("Please log in to comment");
      return;
    }

    // Add comment using the context function
    addComment(postId, commentText[postId]);

    // Clear comment text
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const toggleCategorySelection = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const getStatusIcon = (status: Post['status']) => {
    switch (status) {
      case 'posted':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'waitlist':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getStatusText = (status: Post['status']) => {
    switch (status) {
      case 'posted':
        return 'Reported';
      case 'waitlist':
        return 'In Waitlist';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
    }
  };

  const getStatusClass = (status: Post['status']) => {
    switch (status) {
      case 'posted':
        return 'status-badge-posted';
      case 'waitlist':
        return 'status-badge-waitlist';
      case 'in_progress':
        return 'status-badge-in_progress';
      case 'completed':
        return 'status-badge-completed';
    }
  };

  const filteredPosts = posts
    .filter(post => filter === 'all' || post.status === filter)
    .filter(post =>
      searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.location && post.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(post =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(post.category)
    )
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes.length - a.votes.length;
      } else if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'comments') {
        return b.comments.length - a.comments.length;
      }
      return 0;
    });

  // Stats for dashboard
  const totalIssues = posts.length;
  const resolvedIssues = posts.filter(post => post.status === 'completed').length;
  const inProgressIssues = posts.filter(post => post.status === 'in_progress').length;
  const totalVotes = posts.reduce((sum, post) => sum + post.votes.length, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

  // Mock notifications
  const notifications = [
    { id: 1, type: 'vote', message: 'Your issue received a new vote', time: '2 min ago' },
    { id: 2, type: 'comment', message: 'Someone commented on your post', time: '1 hour ago' },
    { id: 3, type: 'status', message: 'Your issue status was updated', time: '3 hours ago' },
    { id: 4, type: 'system', message: 'Welcome to CivicConnect!', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen cinematic-bg-pattern">
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center animated-bg"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center justify-center mb-4"
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: 1 }}
              >
                <Sparkles className="h-20 w-20 text-white cinematic-pulse" />
              </motion.div>
              <motion.h1
                className="text-5xl font-bold text-white mb-2 cinematic-text text-shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: 1 }}
              >
                CivicConnect
              </motion.h1>
              <motion.p
                className="text-white text-xl text-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Empowering communities through collaboration
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-40 transition-all duration-300 ${scrollPosition > 50
        ? 'bg-white bg-opacity-90 backdrop-blur-md shadow-md'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${scrollPosition > 50 ? 'text-gradient-primary' : 'text-white text-shadow-lg'
                }`}>CivicConnect</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${scrollPosition > 50 ? 'text-indigo-400' : 'text-white'
                  } h-5 w-5`} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-60 ${scrollPosition > 50
                    ? 'bg-indigo-50 border border-indigo-100'
                    : 'bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-80'
                    }`}
                />
              </div>

              <button
                onClick={handleRefresh}
                className={`p-2 rounded-full transition-colors duration-200 ${scrollPosition > 50
                  ? 'text-indigo-500 hover:bg-indigo-50'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-colors duration-200 ${scrollPosition > 50
                    ? 'text-indigo-500 hover:bg-indigo-50'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden cinematic-card">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto cinematic-scrollbar">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-4 border-b hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-full mr-3 ${notification.type === 'vote' ? 'bg-indigo-100 text-indigo-600' :
                              notification.type === 'comment' ? 'bg-green-100 text-green-600' :
                                notification.type === 'status' ? 'bg-amber-100 text-amber-600' :
                                  'bg-blue-100 text-blue-600'
                              }`}>
                              {notification.type === 'vote' ? <ThumbsUp className="h-5 w-5" /> :
                                notification.type === 'comment' ? <MessageCircle className="h-5 w-5" /> :
                                  notification.type === 'status' ? <RefreshCw className="h-5 w-5" /> :
                                    <Bell className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg z-50 overflow-hidden cinematic-card">
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <div>
                        <Link to="/profile" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                          <UserCircle className="h-5 w-5 text-indigo-500 mr-3" />
                          <span>Profile</span>
                        </Link>
                        <Link to="/dashboard" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                          <Home className="h-5 w-5 text-indigo-500 mr-3" />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/settings" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                          <Settings className="h-5 w-5 text-indigo-500 mr-3" />
                          <span>Settings</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin-login" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                            <Shield className="h-5 w-5 text-indigo-500 mr-3" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200 w-full text-left border-t"
                        >
                          <LogOut className="h-5 w-5 text-red-500 mr-3" />
                          <span className="text-red-500">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="cinematic-button py-2 px-5 text-white font-medium rounded-lg">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`p-2 rounded-md ${scrollPosition > 50 ? 'text-gray-700' : 'text-white'
                  }`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="md:hidden bg-white shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pt-2 pb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-indigo-100 rounded-lg bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full"
                  />
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <Link to="/profile" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
                      <UserCircle className="h-5 w-5 text-indigo-500 mr-3" />
                      <span>Profile</span>
                    </Link>

                    <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
                      <Home className="h-5 w-5 text-indigo-500 mr-3" />
                      <span>Dashboard</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link to="/admin-login" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
                        <Shield className="h-5 w-5 text-indigo-500 mr-3" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 text-red-500 mr-3" />
                      <span className="text-red-500">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block cinematic-button py-2 px-5 text-white font-medium rounded-lg text-center">
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <div className="cinematic-hero">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            transform: `translateY(${scrollPosition * 0.2}px)`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="cinematic-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 cinematic-text text-shadow-xl leading-tight">
                Empowering Communities Through <span className="text-indigo-300">Collaboration</span>
              </h1>
              <p className="text-xl text-white text-opacity-90 mb-8 text-shadow-lg max-w-2xl">
                Join thousands of citizens making a difference. Report issues, track progress, and work together to build better communities.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert("Please log in to report an issue");
                      return;
                    }
                    setShowNewPost(true);
                  }}
                  className="cinematic-button py-3 px-8 text-white font-medium rounded-lg flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Report New Issue
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#issues"
                  className="bg-white bg-opacity-10 backdrop-blur-sm text-white py-3 px-8 rounded-lg hover:bg-opacity-20 transition-all duration-200 flex items-center font-medium border border-white border-opacity-20"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Issues
                </motion.a>
              </div>

              <div className="flex flex-wrap gap-4 mt-12">
                <div className="glass-effect rounded-xl p-4 flex items-center">
                  <div className="p-3 rounded-full bg-indigo-500 bg-opacity-20 mr-3">
                    <BarChart2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{totalIssues}</p>
                    <p className="text-sm text-white text-opacity-80">Total Issues</p>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-4 flex items-center">
                  <div className="p-3 rounded-full bg-green-500 bg-opacity-20 mr-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{resolvedIssues}</p>
                    <p className="text-sm text-white text-opacity-80">Resolved</p>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-4 flex items-center">
                  <div className="p-3 rounded-full bg-blue-500 bg-opacity-20 mr-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{totalVotes + totalComments}</p>
                    <p className="text-sm text-white text-opacity-80">Engagements</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Controls */}
        <div id="issues" className="sticky top-16 z-30 glass-card rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide space-x-2">
              {['all', 'posted', 'waitlist', 'in_progress', 'completed'].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilter(status)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === status
                    ? 'cinematic-button text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    } transition-all duration-200`}
                >
                  {status === 'all' ? 'All Issues' : getStatusText(status as Post['status'])}
                </motion.button>
              ))}
            </div>

            <div className="flex space-x-2 w-full md:w-auto">
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center justify-between w-full md:w-48 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm font-medium truncate">
                    {selectedCategories.length === 0
                      ? 'Categories'
                      : `${selectedCategories.length} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden cinematic-card">
                    <div className="p-2 max-h-60 overflow-y-auto cinematic-scrollbar">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className="flex items-center px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          onClick={() => toggleCategorySelection(cat)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => { }}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm">{cat}</span>
                        </div>
                      ))}
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="border-t p-2 flex justify-between">
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowCategoryDropdown(false)}
                          className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={filtersRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Sort</span>
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden cinematic-card">
                    <div className="p-2">
                      {[
                        { value: 'votes', label: 'Most Votes', icon: <ThumbsUp className="h-4 w-4" /> },
                        { value: 'date', label: 'Newest First', icon: <Clock className="h-4 w-4" /> },
                        { value: 'comments', label: 'Most Comments', icon: <MessageCircle className="h-4 w-4" /> }
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-center px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer ${sortBy === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                            }`}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowFilters(false);
                          }}
                        >
                          <span className="mr-2">{option.icon}</span>
                          <span className="text-sm">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`p-2 ${activeView === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`p-2 ${activeView === 'list' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="cinematic-card p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Report a Community Issue</h2>
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setTitle('');
                    setDescription('');
                    setMedia(null);
                    setPreviewUrl(null);
                    setCategory('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="cinematic-input"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="cinematic-input"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Location
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="cinematic-input rounded-r-none"
                      placeholder="Location of the issue"
                      required
                    />
                    <button
                      type="button"
                      className="bg-indigo-100 text-indigo-600 px-3 rounded-r-lg border border-l-0 border-gray-200 hover:bg-indigo-200 transition-colors duration-200"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              // This would normally be converted to an address using a geocoding service
                              const { latitude, longitude } = position.coords;
                              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                                .then(response => response.json())
                                .then(data => {
                                  setLocation(data.display_name);
                                })
                                .catch(error => {
                                  console.error("Error fetching location name:", error);
                                  setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                                });
                            },
                            (error) => {
                              console.error("Error getting location:", error);
                              setLocation("Unknown location");
                            }
                          );
                        } else {
                          setLocation("Unknown location");
                        }
                      }}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="cinematic-input"
                    rows={4}
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Media (Image or Video)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                    id="media-upload-dashboard"
                  />
                  <label
                    htmlFor="media-upload-dashboard"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-indigo-200 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-indigo-300" />
                        <p className="mt-2 text-sm text-indigo-500">
                          Click to upload media (optional)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    type="submit"
                    disabled={uploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 cinematic-button py-3 px-4 text-white rounded-lg"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </div>
                    ) : (
                      'Post Issue'
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowNewPost(false);
                      setTitle('');
                      setDescription('');
                      setMedia(null);
                      setPreviewUrl(null);
                      setCategory('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="mt-2 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Posts Display */}
        {!loading && filteredPosts.length > 0 ? (
          <>
            {/* Grid View */}
            {activeView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    className="cinematic-card cinematic-card-hover overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
                          {post.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{post.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`status-badge ${getStatusClass(post.status)} cinematic-badge`}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1">{getStatusText(post.status)}</span>
                      </div>
                    </div>


                    {/* Media */}
                    {post.media && (
                      <div className="relative aspect-video cinematic-gradient-overlay">
                        {post.mediaType === 'image' ? (
                          <img
                            src={`data:${post.media.contentType};base64,${post.media.data.toString('base64')}`}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={`data:${post.media.contentType};base64,${post.media.data.toString('base64')}`}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Post Content */}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                      <p className="text-gray-700 mb-3 text-sm line-clamp-2">{post.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.category && (
                          <span className="cinematic-badge">
                            {post.category}
                          </span>
                        )}
                        {post.location && (
                          <span className="cinematic-badge flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {post.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t pt-3">
                        <motion.button
                          onClick={() => handleVote(post._id)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${post.votes.includes(userId)
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            } transition-colors duration-200`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          animate={voteAnimation === post._id ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.5 }
                          } : {}}
                        >
                          <ThumbsUp className={`h-5 w-5 ${post.votes.includes(userId) ? 'fill-current' : ''}`} />
                          <span className="font-medium">{post.votes.length}</span>
                        </motion.button>
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => handleShare(post._id)}
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedPost === post._id && (
                          <motion.div
                            className="mt-4 border-t pt-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h3 className="font-medium text-gray-900 mb-3">Comments</h3>

                            <div className="max-h-60 overflow-y-auto cinematic-scrollbar pr-2">
                              {post.comments && post.comments.length > 0 ? (
                                <div className="space-y-4 mb-4">
                                  {post.comments.map((comment) => (
                                    <div key={comment._id} className="flex space-x-3">
                                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                        {comment.user.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <p className="font-medium text-sm text-gray-900">{comment.user.name}</p>
                                          <p className="text-gray-700 text-sm">{comment.text}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(comment.createdAt).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to comment!</p>
                              )}
                            </div>

                            {/* Add Comment */}
                            <div className="flex space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 flex">
                                <input
                                  type="text"
                                  value={commentText[post._id] || ''}
                                  onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                  placeholder="Add a comment..."
                                  className="flex-1 cinematic-input rounded-r-none"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(post._id);
                                    }
                                  }}
                                />
                                <motion.button
                                  onClick={() => handleAddComment(post._id)}
                                  className="cinematic-button text-white px-3 py-2 rounded-r-lg"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Send className="h-5 w-5" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {activeView === 'list' && (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    className={`cinematic-card cinematic-card-hover overflow-hidden ${selectedPost?._id === post._id ? 'border-2 border-indigo-500' : ''
                      }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Media (if available) */}
                      {post.media && (
                        <div className="md:w-1/3 relative cinematic-gradient-overlay">
                          {post.mediaType === 'image' ? (
                            <img
                              src={`data:${post.media.contentType};base64,${post.media.data.toString('base64')}`}
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          ) : (
                            <video
                              src={`data:${post.media.contentType};base64,${post.media.data.toString('base64')}`}
                              controls
                              className="w-full h-48 md:h-full object-cover"
                            />
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className={`p-4 ${post.mediaUrl ? 'md:w-2/3' : 'w-full'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
                              {post.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{post.user.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`status-badge ${getStatusClass(post.status)} cinematic-badge`}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1">{getStatusText(post.status)}</span>
                          </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                        <p className="text-gray-700 mb-3">{post.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.category && (
                            <span className="cinematic-badge">
                              {post.category}
                            </span>
                          )}
                          {post.location && (
                            <span className="cinematic-badge flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {post.location}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(post._id);
                            }}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${post.votes.includes(userId)
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-gray-600 hover:bg-gray-100'
                              } transition-colors duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            animate={voteAnimation === post._id ? {
                              scale: [1, 1.2, 1],
                              transition: { duration: 0.5 }
                            } : {}}
                          >
                            <ThumbsUp className={`h-5 w-5 ${post.votes.includes(userId) ? 'fill-current' : ''}`} />
                            <span className="font-medium">{post.votes.length}</span>
                          </motion.button>
                          <button
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPost(expandedPost === post._id ? null : post._id);
                            }}
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments ? post.comments.length : 0}</span>
                          </button>
                          <button
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(post._id);
                            }}
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedPost === post._id && (
                            <motion.div
                              className="mt-4 border-t pt-4"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3 className="font-medium text-gray-900 mb-3">Comments</h3>

                              <div className="max-h-60 overflow-y-auto cinematic-scrollbar pr-2">
                                {post.comments && post.comments && post.comments.length > 0 ? (
                                  <div className="space-y-4 mb-4">
                                    {post.comments.map((comment) => (
                                      <div key={comment._id} className="flex space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                          {comment.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="font-medium text-sm text-gray-900">{comment.user.name}</p>
                                            <p className="text-gray-700 text-sm">{comment.text}</p>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(comment.createdAt).toLocaleString(undefined, {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to comment!</p>
                                )}
                              </div>

                              {/* Add Comment */}
                              <div className="flex space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 flex">
                                  <input
                                    type="text"
                                    value={commentText[post._id] || ''}
                                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                    placeholder="Add a comment..."
                                    className="flex-1 cinematic-input rounded-r-none"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(post._id);
                                      }
                                    }}
                                  />
                                  <motion.button
                                    onClick={() => handleAddComment(post._id)}
                                    className="cinematic-button text-white px-3 py-2 rounded-r-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Send className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : !loading && (
          <div className="text-center py-16 cinematic-card">
            <div className="max-w-md mx-auto">
              <div className="mb-6 relative cinematic-glow">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-indigo-100 animate-pulse-slow"></div>
                </div>
                <AlertTriangle className="h-16 w-16 text-indigo-400 mx-auto relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                  setSelectedCategories([]);
                }}
                className="cinematic-button py-2 px-5 text-white font-medium rounded-lg mx-auto"
              >
                Reset Filters
              </motion.button>
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-16 mb-8 relative overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
              transform: `translateY(${scrollPosition * 0.1}px)`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-900/70"></div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 cinematic-text text-shadow-lg">
                Join the Movement for Better Communities
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Together we can make a difference. Report issues, vote on priorities, and track progress as we build stronger, more responsive communities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    setShowNewPost(true);
                  }}
                  className="cinematic-button py-3 px-8 text-white font-medium rounded-lg flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Report an Issue
                </motion.button>

                {!isAuthenticated && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="bg-white text-indigo-700 py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center font-medium"
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    Create Account
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient-secondary mb-4">CivicConnect</h3>
              <p className="text-gray-400 mb-4">
                Empowering communities through collaboration and civic engagement.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Success Stories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Subscribe to Updates</h3>
              <p className="text-gray-400 mb-4">
                Stay informed about community issues and progress.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="cinematic-input rounded-r-none bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="cinematic-button px-4 py-2 rounded-r-lg text-white"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 CivicConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - Admin Access */}
      {user?.role === 'admin' && (
        <Link
          to="/admin-login"
          className="fixed bottom-6 right-6 cinematic-button p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-30"
        >
          <Shield className="h-6 w-6" />
        </Link>
      )}

      {/* Floating Action Button - Report Issue (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!isAuthenticated) {
            alert("Please log in to report an issue");
            return;
          }
          setShowNewPost(true);
        }}
        className="md:hidden fixed bottom-6 left-6 cinematic-button p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-30"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
};

export default Dashboard;