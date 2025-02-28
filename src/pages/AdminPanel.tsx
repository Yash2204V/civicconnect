import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin,
  MessageCircle,
  Vote,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const categories = [
  'All Categories',
  'Infrastructure & Public Services',
  'Environmental Concerns',
  'Law & Order Issues',
  'Housing & Urban Development',
  'Education & Healthcare',
  'Unemployment & Economic Issues',
  'Digital & Technological Issues',
  'Governance & Political Issues',
  'Social Issues'
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, error, fetchPosts, addComment, updatePostStatus } = usePosts();
  
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateStatus = async (postId: string, status: 'posted' | 'waitlist' | 'in_progress' | 'completed') => {
    try {
      await updatePostStatus(postId, status);
      
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost({...selectedPost, status});
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;
    
    try {
      await addComment(postId, commentText[postId]);
      setCommentText({...commentText, [postId]: ''});
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/admin-login');
  };

  const filteredPosts = posts
    .filter(post => filter === 'all' || post.status === filter)
    .filter(post => categoryFilter === 'All Categories' || post.category === categoryFilter)
    .filter(post => 
      searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-yellow-100 text-yellow-800';
      case 'waitlist':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'waitlist':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  // Stats for dashboard
  const stats = [
    { 
      name: 'Total Issues', 
      value: posts.length, 
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      color: 'bg-red-50'
    },
    { 
      name: 'In Progress', 
      value: posts.filter(post => post.status === 'in_progress').length,
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50'
    },
    { 
      name: 'Completed', 
      value: posts.filter(post => post.status === 'completed').length,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50'
    },
    { 
      name: 'Total Votes', 
      value: posts.reduce((sum, post) => sum + post.votes.length, 0),
      icon: <Vote className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">CivicConnect Admin</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View Public Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.color} overflow-hidden rounded-lg shadow`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="posted">Posted</option>
                <option value="waitlist">Waitlist</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              onClick={() => fetchPosts()}
              className="mt-2 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Issues List */}
        <div className="grid grid-cols-1 gap-6">
          {!loading && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.div 
                key={post._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                      <div className="flex items-center mt-1">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.user.name}`}
                          alt={post.user.name}
                          className="h-5 w-5 rounded-full mr-2"
                        />
                        <p className="text-sm text-gray-500">
                          Posted by {post.user.name} ({post.user.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-sm font-medium">
                        {post.votes.length} votes
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.category && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {post.category}
                      </span>
                    )}
                    {post.location && (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {post.location}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700 mb-4">{post.description}</p>

                      {post.mediaType === 'image' ? (
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}
                    </div>

                    <div>
                      {/* Status Update Buttons */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Update Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateStatus(post._id, 'waitlist')}
                            className={`flex items-center justify-center px-4 py-2 rounded ${
                              post.status === 'waitlist'
                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Waitlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(post._id, 'in_progress')}
                            className={`flex items-center justify-center px-4 py-2 rounded ${
                              post.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Clock className="w-5 h-5 mr-2" />
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(post._id, 'completed')}
                            className={`flex items-center justify-center px-4 py-2 rounded ${
                              post.status === 'completed'
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(post._id, 'posted')}
                            className={`flex items-center justify-center px-4 py-2 rounded ${
                              post.status === 'posted'
                                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div>
                        <button
                          onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium mb-4 flex items-center"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {expandedPost === post._id ? 'Hide Comments' : `Show Comments (${post.comments?.length || 0})`}
                        </button>
                        
                        {expandedPost === post._id && (
                          <div className="mb-4 border-t border-gray-100 pt-4">
                            {post.comments && post.comments.length > 0 ? (
                              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {post.comments.map((comment: Comment) => (
                                  <div key={comment._id} className="flex space-x-3">
                                    <img
                                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.name}`}
                                      alt={comment.user.name}
                                      className="h-8 w-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium text-sm text-gray-900">{comment.user.name}</p>
                                        <p className="text-gray-700 text-sm">{comment.text}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm mb-3">No comments yet.</p>
                            )}
                            
                            <div className="flex space-x-3">
                              <img
                                src="https://api.dicebear.com/7.x/initials/svg?seed=Admin"
                                alt="Admin"
                                className="h-8 w-8 rounded-full"
                              />
                              <div className="flex-1 flex">
                                <input
                                  type="text"
                                  value={commentText[post._id] || ''}
                                  onChange={(e) => setCommentText({...commentText, [post._id]: e.target.value})}
                                  placeholder="Add an admin comment..."
                                  className="flex-1 bg-gray-50 border border-gray-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(post._id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors duration-200"
                                >
                                  Comment
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : !loading && (
            <div className="text-center py-10">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;