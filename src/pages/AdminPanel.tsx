import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  ArrowLeft,
  Filter,
  MapPin,
  LogOut,
  RefreshCw,
  ChevronDown,
  X,
  MessageCircle,
  ThumbsUp,
  Send,
  Eye,
  EyeOff,
  BarChart2,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Layers,
  Zap,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosts } from '../context/PostContext';
import ThemeToggle from '../components/ThemeToggle';

interface Post {
  _id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  media?: {
    data: Buffer;
    contentType: string;
  };
  mediaType: 'image' | 'video';
  status: 'posted' | 'waitlist' | 'in_progress' | 'completed';
  votes: string[];
  category: string;
  location: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  text: string;
  createdAt: string;
}

interface CategoryData {
  name: string;
  count: number;
  color: string;
}

interface StatusData {
  name: string;
  count: number;
  color: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { posts, loading, error, fetchPosts, updatePostStatus } = usePosts();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');
  const [showIntro, setShowIntro] = useState(true);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Check if admin is authenticated
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/indiancops-login');
    }
  }, [navigate]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();

    // Hide intro after 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
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
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/indiancops-login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleUpdateStatus = async (postId: string, status: Post['status']) => {
    setIsUpdating(true);
    try {
      await updatePostStatus(postId, status);

      // Update the selected post if it's the one being updated
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    } finally {
      setIsUpdating(false);
    }
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

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'posted':
        return '#fcd34d';
            case 'waitlist':
        return '#fdba74';
            case 'in_progress':
        return '#93c5fd';
            case 'completed':
        return '#6ee7b7';
    }
  };

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => filter === 'all' || post.status === filter)
    .filter(post =>
      searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      } else if (sortBy === 'status') {
        const statusOrder = { posted: 0, waitlist: 1, in_progress: 2, completed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === 'comments') {
        return b.comments.length - a.comments.length;
      }
      return 0;
    });

  // Calculate statistics
  const totalIssues = posts.length;
  const resolvedIssues = posts.filter(post => post.status === 'completed').length;
  const inProgressIssues = posts.filter(post => post.status === 'in_progress').length;
  const waitlistIssues = posts.filter(post => post.status === 'waitlist').length;
  const reportedIssues = posts.filter(post => post.status === 'posted').length;
  const totalVotes = posts.reduce((sum, post) => sum + post.votes.length, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  const uniqueUsers = new Set(posts.map(post => post.user._id)).size;

  // Category data for charts
  const categories = posts.reduce((acc: { [key: string]: number }, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  const categoryColors = [
    '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#84cc16',
    '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7'
  ];

  const categoryData: CategoryData[] = Object.entries(categories)
    .map(([name, count], index) => ({
      name,
      count,
      color: categoryColors[index % categoryColors.length]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status data for charts
  const statusData: StatusData[] = [
    { name: 'Reported', count: reportedIssues, color: getStatusColor('posted') },
    { name: 'Waitlist', count: waitlistIssues, color: getStatusColor('waitlist') },
    { name: 'In Progress', count: inProgressIssues, color: getStatusColor('in_progress') },
    { name: 'Completed', count: resolvedIssues, color: getStatusColor('completed') }
  ];

  // Recent activity
  const recentActivity = [
    ...posts.map(post => ({
      type: 'post',
      title: post.title,
      user: post.user.name,
      status: post.status,
      date: new Date(post.createdAt)
    })),
    ...posts.flatMap(post => post.comments.map(comment => ({
      type: 'comment',
      title: post.title,
      user: comment.user.name,
      text: comment.text,
      date: new Date(comment.createdAt)
    }))),
    ...posts.flatMap(post => post.votes.map((_, index) => ({
      type: 'vote',
      title: post.title,
      user: 'A user',
      date: new Date(new Date(post.createdAt).getTime() + index * 86400000)
    })))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern dark:bg-gray-800 dark:cinematic-bg-pattern dark:border dark:border-gray-700">
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-primary "
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
                transition={{ duration: 2 }}
              >
                <Sparkles className="h-16 w-16 text-white" />
              </motion.div>
              <motion.h1
                className="text-4xl font-bold text-white mb-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5 }}
              >
                Admin Dashboard
              </motion.h1>
              <motion.p
                className="text-white text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Manage community issues
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white bg-opacity-90 backdrop-blur-md border-b shadow-sm sticky top-0 z-40 dark:bg-gray-800 dark:cinematic-bg-pattern dark:border dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gradient-primary">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200 text-indigo-600"
                title={showStats ? "Hide Statistics" : "Show Statistics"}
              >
                {showStats ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200 text-indigo-600"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200 text-indigo-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-amber-200 text-amber-700">
                      <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="ml-2 font-semibold text-amber-900">Total Issues</h3>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">{totalIssues}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-emerald-200 text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="ml-2 font-semibold text-emerald-900">Resolved</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">{resolvedIssues}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-blue-200 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="ml-2 font-semibold text-blue-900">Users</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{uniqueUsers}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-purple-200 text-purple-700">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h3 className="ml-2 font-semibold text-purple-900">Engagement</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{totalVotes + totalComments}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Issue Status Distribution</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    {statusData.map((status) => (
                      <div
                        key={status.name}
                        className="h-4 rounded-full"
                        style={{
                          backgroundColor: status.color,
                          width: `${(status.count / totalIssues) * 100}%`
                        }}
                        title={`${status.name}: ${status.count} (${Math.round((status.count / totalIssues) * 100)}%)`}
                      ></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {statusData.map((status) => (
                      <div key={status.name} className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="text-xs text-gray-600">{status.name}: {status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{category.name}</span>
                        <span>{category.count} issues</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${(category.count / Math.max(...categoryData.map(c => c.count))) * 100}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b mb-6 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'issues'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Issues Management
            {activeTab === 'issues' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                layoutId="adminActiveTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'activity'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            Recent Activity
            {activeTab === 'activity' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                layoutId="adminActiveTab"
              />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'issues' && (
            <motion.div
              key="issues-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Posts List */}
                <div className="md:w-1/2 lg:w-2/3">
                  <div className="bg-white rounded-xl shadow-sm p-4 mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0 dark:text-gray-100">Community Issues</h2>
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4 dark:text-indigo-500" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-indigo-100 rounded-lg bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                          />
                        </div>
                        <div className="relative" ref={filtersRef}>
                          <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                          >
                            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium dark:text-gray-300">Sort</span>
                          </button>

                          {showFilters && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                              <div className="p-2">
                                {[
                                  { value: 'votes', label: 'Most Votes', icon: <ThumbsUp className="h-4 w-4" /> },
                                  { value: 'date', label: 'Newest First', icon: <Calendar className="h-4 w-4" /> },
                                  { value: 'comments', label: 'Most Comments', icon: <MessageCircle className="h-4 w-4" /> },
                                  { value: 'status', label: 'By Status', icon: <Layers className="h-4 w-4" /> }
                                ].map((option) => (
                                  <div
                                    key={option.value}
                                    className={`flex items-center px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer ${sortBy === option.value
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-300'
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
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {['all', 'posted', 'waitlist', 'in_progress', 'completed'].map((status) => (
                        <motion.button
                          key={status}
                          onClick={() => setFilter(status)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter === status
                              ? 'bg-gradient-primary text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                            } transition-colors duration-200`}
                        >
                          {status === 'all' ? 'All Issues' : getStatusText(status as Post['status'])}
                        </motion.button>
                      ))}
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                      <div className="relative" ref={categoryDropdownRef}>
                        <button
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-300"
                        >
                          <span className="font-medium truncate">
                            {selectedCategories.length === 0
                              ? 'Filter by Category'
                              : `${selectedCategories.length} categories selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>

                        {showCategoryDropdown && (
                          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                              {Array.from(new Set(posts.map(post => post.category))).map((cat) => (
                                <div
                                  key={cat}
                                  className="flex items-center px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer dark:hover:bg-indigo-900"
                                  onClick={() => toggleCategorySelection(cat)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => { }}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <span className="ml-2 text-sm dark:text-gray-300">{cat}</span>
                                </div>
                              ))}
                            </div>
                            {selectedCategories.length > 0 && (
                              <div className="border-t p-2 flex justify-between dark:border-gray-700">
                                <button
                                  onClick={() => setSelectedCategories([])}
                                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  Clear all
                                </button>
                                <button
                                  onClick={() => setShowCategoryDropdown(false)}
                                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  Apply
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

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
                      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 dark:bg-red-900 dark:border-red-800 dark:text-red-100">
                        <p className="font-medium">{error}</p>
                        <button
                          onClick={() => fetchPosts()}
                          className="mt-2 text-sm font-medium underline dark:text-red-200"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {/* Posts List */}
                    {!loading && filteredPosts.length > 0 ? (
                      <div className="space-y-3">
                        {filteredPosts.map((post) => (
                          <motion.div
                            key={post._id}
                            onClick={() => setSelectedPost(post)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedPost?._id === post._id
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-gray-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20'
                              }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{post.title}</h3>
                              <span className={`status-badge ${getStatusClass(post.status)}`}>
                                {getStatusIcon(post.status)}
                                <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-2 line-clamp-2 dark:text-gray-300">{post.description}</p>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {post.category && (
                                <span className="category-badge dark:bg-gray-700 dark:text-gray-100">
                                  {post.category}
                                </span>
                              )}
                              {post.location && (
                                <span className="location-badge dark:bg-gray-700 dark:text-gray-100">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {post.location}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <div className="h-5 w-5 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-medium shadow-sm mr-1">
                                  {post.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{post.user.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <ThumbsUp className="h-3 w-3 mr-1 text-indigo-500 dark:text-indigo-400" />
                                  {post.votes.length}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1 text-indigo-500 dark:text-indigo-400" />
                                  {post.comments.length}
                                </span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : !loading && (
                      <div className="text-center py-10">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4 dark:text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No issues found</h3>
                        <p className="text-gray-500 mt-2 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Post Details */}
                <div className="md:w-1/2 lg:w-1/3">
                  {selectedPost ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 dark:bg-gray-800 dark:border dark:border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedPost.title}</h2>
                        <span className={`status-badge ${getStatusClass(selectedPost.status)} dark:bg-gray-700`}>
                          {getStatusIcon(selectedPost.status)}
                          <span className="ml-1 capitalize">{selectedPost.status.replace('_', ' ')}</span>
                        </span>
                      </div>

                      {/* Media */}
                      {selectedPost.media && (
                        <div className="relative aspect-video cinematic-gradient-overlay">
                          {selectedPost.mediaType === 'image' ? (
                            <img
                              src={`data:${selectedPost.media.contentType};base64,${selectedPost.media.data.toString('base64')}`}
                              alt={selectedPost.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={`data:${selectedPost.media.contentType};base64,${selectedPost.media.data.toString('base64')}`}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-1 dark:text-gray-100">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">{selectedPost.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedPost.category && (
                          <span className="category-badge dark:bg-gray-700 dark:text-gray-100">
                            {selectedPost.category}
                          </span>
                        )}
                        {selectedPost.location && (
                          <span className="location-badge dark:bg-gray-700 dark:text-gray-100">
                            <MapPin className="h-3 w-3 mr-1" />
                            {selectedPost.location}
                          </span>
                        )}
                      </div>

                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-1 dark:text-gray-100">Reported by</h3>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-medium shadow-sm mr-2">
                            {selectedPost.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPost.user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedPost.user.email || 'No email provided'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Update Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['posted', 'waitlist', 'in_progress', 'completed'].map((status) => (
                            <motion.button
                              key={status}
                              onClick={() => handleUpdateStatus(selectedPost._id, status as Post['status'])}
                              disabled={isUpdating || selectedPost.status === status}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center ${selectedPost.status === status
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                  : `${getStatusClass(status as Post['status'])} hover:opacity-90`
                                } transition-colors duration-200`}
                            >
                              {getStatusIcon(status as Post['status'])}
                              <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Comments ({selectedPost.comments.length})</h3>
                        {selectedPost.comments.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 mb-4">
                            {selectedPost.comments.map((comment) => (
                              <div key={comment._id} className="flex space-x-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                  {comment.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.user.name}</p>
                                    <p className="text-gray-700 text-sm dark:text-gray-300">{comment.text}</p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
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
                          <p className="text-gray-500 text-sm mb-4 dark:text-gray-400">No comments yet.</p>
                        )}

                        {/* Add Comment */}
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                            A
                          </div>
                          <div className="flex-1 flex">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add an admin comment..."
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            />
                            <motion.button
                              className="bg-gradient-primary text-white px-3 py-2 rounded-r-lg transition-colors duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Send className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center dark:bg-gray-800 dark:border dark:border-gray-700">
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 rounded-full bg-indigo-100 animate-pulse-slow dark:bg-indigo-900"></div>
                        </div>
                        <AlertTriangle className="h-16 w-16 text-indigo-400 mx-auto relative z-10 dark:text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No issue selected</h3>
                      <p className="text-gray-500 mt-2 dark:text-gray-400">Select an issue from the list to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:border dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 dark:text-gray-100">Recent Activity</h3>

              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.type === 'post'
                          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                          : activity.type === 'comment'
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                        {activity.type === 'post'
                          ? <Layers className="h-5 w-5" />
                          : activity.type === 'comment'
                            ? <MessageCircle className="h-5 w-5" />
                            : <ThumbsUp className="h-5 w-5" />
                        }
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute top-10 bottom-0 left-1/2 w-0.5 -ml-px bg-gray-200 h-full dark:bg-gray-700"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.type === 'post'
                              ? 'New Issue Reported'
                              : activity.type === 'comment'
                                ? 'New Comment'
                                : 'New Vote'
                            }
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.date.toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2 dark:text-gray-300">
                          <span className="font-medium">{activity.user}</span>
                          {activity.type === 'post'
                            ? ' reported a new issue: '
                            : activity.type === 'comment'
                              ? ' commented on '
                              : ' voted on '
                          }
                          <span className="font-medium">"{activity.title}"</span>
                        </p>
                        {activity.type === 'comment' && activity.text && (
                          <p className="text-sm bg-white p-2 rounded border border-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                            "{activity.text}"
                          </p>
                        )}
                        {activity.type === 'post' && activity.status && (
                          <div className="mt-2">
                            <span className={`status-badge ${getStatusClass(activity.status as Post['status'])} `}>
                              {getStatusIcon(activity.status as Post['status'])}
                              <span className="ml-1 capitalize">{activity.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;