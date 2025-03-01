import React, { useState, useEffect } from 'react';
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
  UserCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { posts, loading, error, fetchPosts, addComment, votePost, createPost } = usePosts();
  const [filter, setFilter] = useState('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(user?._id || 'user-' + Math.floor(Math.random() * 1000)); // Use authenticated user ID if available
  const [userName, setUserName] = useState(user?.name || 'Community Member');
  const [voteAnimation, setVoteAnimation] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would normally be converted to an address using a geocoding service
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
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
    if (user) {
      setUserId(user._id);
      setUserName(user.name);
    }
  }, [user]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
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
      // Create a new post using the context function
      await createPost({
        title,
        description,
        mediaUrl: previewUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop', // Default image if none provided
        mediaType: 'image',
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
    setCommentText({...commentText, [postId]: ''});
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

  const getStatusIcon = (status: Post['status']) => {
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

  const filteredPosts = posts
    .filter(post => filter === 'all' || post.status === filter)
    .filter(post => 
      searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.location && post.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b fixed w-full top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-blue-600">CivicConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {isAuthenticated ? (
                <Link to="/profile" className="text-blue-600 hover:text-blue-800">
                  <UserCircle className="h-6 w-6" />
                </Link>
              ) : (
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Filters */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {['all', 'posted', 'waitlist', 'in_progress', 'completed'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-colors duration-200 shadow-sm`}
            >
              {status === 'all' ? 'All Issues' : getStatusText(status as Post['status'])}
            </motion.button>
          ))}
        </div>

        {/* Create Post Button */}
        <motion.button
          onClick={() => {
            if (!isAuthenticated) {
              alert("Please log in to report an issue");
              return;
            }
            setShowNewPost(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 mb-6 flex items-center justify-center shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report New Issue
        </motion.button>

        {/* Create Post Form */}
        {showNewPost && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Report a Community Issue</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief title of the issue"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Location of the issue"
                    required
                  />
                  <button
                    type="button"
                    className="ml-2 bg-gray-100 p-2 rounded-lg"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
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
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Detailed description of the issue"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
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
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors duration-200"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
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
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 shadow-sm"
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
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

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

        {/* Posts Grid */}
        <div className="space-y-6">
          {!loading && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.div 
                key={post._id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.user.name}`}
                      alt={post.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{post.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(post.status)}
                    <span className="text-sm font-medium capitalize">{getStatusText(post.status)}</span>
                  </div>
                </div>

                {/* Media */}
                {post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full aspect-video object-cover"
                  />
                )}

                {/* Post Content */}
                <div className="p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.button
                      onClick={() => handleVote(post._id)}
                      className={`flex items-center space-x-1 ${
                        post.votes.includes(userId)
                          ? 'text-blue-500'
                          : 'text-gray-600'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={voteAnimation === post._id ? { 
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.5 }
                      } : {}}
                    >
                      <Vote className={`h-6 w-6 ${post.votes.includes(userId) ? 'fill-current' : ''}`} />
                      <span className="font-medium">{post.votes.length}</span>
                    </motion.button>
                    <button 
                      className="text-gray-600 flex items-center space-x-1"
                      onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span>{post.comments ? post.comments.length : 0}</span>
                    </button>
                    <button 
                      className="text-gray-600"
                      onClick={() => handleShare(post._id)}
                    >
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-700 mb-2">{post.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
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
                  </div>
                  
                  {/* Comments Section */}
                  {expandedPost === post._id && (
                    <motion.div 
                      className="mt-4 border-t pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="font-medium text-gray-900 mb-3">Comments</h3>
                      
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {post.comments.map((comment) => (
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
                        <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to comment!</p>
                      )}
                      
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`}
                          alt={userName}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="flex-1 flex">
                          <input
                            type="text"
                            value={commentText[post._id] || ''}
                            onChange={(e) => setCommentText({...commentText, [post._id]: e.target.value})}
                            placeholder="Add a comment..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post._id);
                              }
                            }}
                          />
                          <motion.button
                            onClick={() => handleAddComment(post._id)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Send className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
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
      </div>

      {/* Floating Action Button - Admin Access */}
      {user?.role === 'admin' && (
        <Link
          to="/admin-login"
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <AlertTriangle className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
};

export default Dashboard;