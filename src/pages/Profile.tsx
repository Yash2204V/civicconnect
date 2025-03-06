import React, { useState, useEffect } from 'react';
import {
  Upload,
  Loader,
  X,
  Settings,
  LogOut,
  ArrowLeft,
  ThumbsUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin,
  User,
  Mail,
  Phone,
  Save,
  Camera,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageCircle,
  Share2,
  Eye,
  Award,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { userPosts, loading, error, fetchUserPosts, createPost, updatePost, deletePost } = usePosts();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    bio: ''
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Stats for the profile
  const stats: Stat[] = [
    {
      label: 'Posts',
      value: userPosts.length,
      icon: <Upload className="h-4 w-4" />,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      label: 'Votes',
      value: userPosts.reduce((sum, post) => sum + post.votes.length, 0),
      icon: <ThumbsUp className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Comments',
      value: userPosts.reduce((sum, post) => sum + post.comments.length, 0),
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Resolved',
      value: userPosts.filter(post => post.status === 'completed').length,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-100 text-green-600'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUserPosts();
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Update user profile when user data changes
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    // Get user's location when creating a new post
    if (showNewPost && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would normally be converted to an address using a geocoding service
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [showNewPost]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    setUploading(true);
    try {
      // Determine media type from file
      let mediaType = 'image';
      if (media && media.type.startsWith('video/')) {
        mediaType = 'video';
      }

      await createPost({
        title,
        description,
        media: media || undefined,
        mediaType: mediaType as 'image' | 'video',
        category,
        location: location || 'Unknown location'
      });

      setTitle('');
      setDescription('');
      setMedia(null);
      setPreviewUrl(null);
      setCategory('');
      setShowNewPost(false);

      // Refresh user posts
      fetchUserPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile on the server
    // For now, we'll just show a success message
    alert('Profile updated successfully!');
    setShowSettings(false);
    setIsEditingBio(false);
  };

  const confirmDeletePost = () => {
    // In a real app, this would delete the post
    // For now, we'll just show a success message
    alert('Post deleted successfully!');
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const handleUpdatePost = async () => {
    if (!editingPostId) return;

    try {
      await updatePost(editingPostId, {
        title,
        description,
        category,
        location
      });

      setShowNewPost(false);
      setEditingPostId(null);
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post._id);
    setTitle(post.title);
    setDescription(post.description);
    setCategory(post.category);
    setLocation(post.location);
    setShowNewPost(true);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'waitlist':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'posted':
        return 'status-badge-posted';
      case 'waitlist':
        return 'status-badge-waitlist';
      case 'in_progress':
        return 'status-badge-in_progress';
      case 'completed':
        return 'status-badge-completed';
      default:
        return 'status-badge-posted';
    }
  };

  if (loading && userPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern">
      {/* Header */}
      <div className="bg-white bg-opacity-90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-8">
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center">
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="relative">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                  <Camera className="h-5 w-5 text-indigo-600" />
                  <input
                    type="file"
                    id="profile-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </p>

                <div className="mt-3">
                  {isEditingBio ? (
                    <div className="flex flex-col space-y-2">
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="input-primary h-20"
                        placeholder="Write something about yourself..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <p className="text-gray-700 text-sm">
                        {userProfile.bio || "No bio yet. Click to add one."}
                      </p>
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md m-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Name
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3">
                      <User className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3">
                      <Mail className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3">
                      <Phone className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Address
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3">
                      <MapPin className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={userProfile.address}
                      onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full mt-6 btn-primary flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                Delete Post
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => postToDelete && handleDeletePost()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPostId ? 'Edit Post' : 'New Post'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setEditingPostId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setEditingPostId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {showNewPost ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
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
                    className="input-primary"
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
                    className="input-primary"
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
                      className="input-primary rounded-r-none"
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
                              setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                            },
                            (error) => {
                              console.error("Error getting location:", error);
                            }
                          );
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
                    className="input-primary"
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
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
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
                    className="flex-1 btn-primary"
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
                      'Create Post'
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
          ) : (
            <motion.button
              onClick={() => setShowNewPost(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3 mb-8 flex items-center justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Upload className="w-5 h-5 mr-2" />
              Create New Post
            </motion.button>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => fetchUserPosts()}
              className="mt-2 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'posts'
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            My Posts
            {activeTab === 'posts' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'activity'
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Activity
            {activeTab === 'activity' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'achievements'
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Achievements
            {activeTab === 'achievements' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                layoutId="activeTab"
              />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Posts List View */}
              {userPosts.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {userPosts.map((post) => (
                    <motion.div
                      key={post._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col md:flex-row">
                        {post.media && (
                          <div className="aspect-video relative">
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
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <button
                                onClick={() => handleDeleteClick(post._id)}
                                className="p-1.5 bg-white bg-opacity-80 rounded-full text-red-500 hover:text-red-700 hover:bg-opacity-100 transition-colors duration-200 shadow-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="p-1.5 bg-white bg-opacity-80 rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-opacity-100 transition-colors duration-200 shadow-sm"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                            <span className={`status-badge ${getStatusClass(post.status)}`}>
                              {getStatusIcon(post.status)}
                              <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.category && (
                              <span className="category-badge">
                                {post.category}
                              </span>
                            )}
                            {post.location && (
                              <span className="location-badge">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.location}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-3">{post.description}</p>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between border-t pt-3">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-gray-500 text-sm">
                                  <ThumbsUp className="h-4 w-4 mr-1 text-indigo-500" />
                                  <span>{post.votes.length} votes</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <MessageCircle className="h-4 w-4 mr-1 text-indigo-500" />
                                  <span>{post.comments.length} comments</span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{new Date(post.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                            </div>

                            <div className="flex mt-3">
                              <button
                                onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                {expandedPost === post._id ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Hide Comments
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    View Comments
                                  </>
                                )}
                              </button>
                            </div>

                            <AnimatePresence>
                              {expandedPost === post._id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-3 pt-3 border-t"
                                >
                                  <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {post.comments && post.comments.length > 0 ? (
                                      <div className="space-y-3">
                                        {post.comments.map((comment) => (
                                          <div key={comment._id} className="flex space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
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
                                      <p className="text-gray-500 text-sm">No comments yet.</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-32 w-32 rounded-full bg-indigo-100 animate-pulse-slow"></div>
                      </div>
                      <AlertTriangle className="h-16 w-16 text-indigo-400 mx-auto relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-6">Create your first post to get started</p>
                    <button
                      onClick={() => setShowNewPost(true)}
                      className="btn-primary mx-auto"
                    >
                      Create Post
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post._id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                      <div className={`p-2 rounded-full ${getStatusClass(post.status)}`}>
                        {getStatusIcon(post.status)}
                      </div>
                      <div>
                        <p className="text-gray-900">
                          Your post <span className="font-medium">"{post.title}"</span> is now <span className="font-medium capitalize">{post.status.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {userPosts.flatMap(post => post.votes.map((vote, index) => (
                    <div key={`${post._id}-vote-${index}`} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                        <ThumbsUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-900">
                          Someone voted on your post <span className="font-medium">"{post.title}"</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(new Date(post.createdAt).getTime() + index * 86400000).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )))}

                  {userPosts.flatMap(post => post.comments.map((comment, index) => (
                    <div key={`${post._id}-comment-${index}`} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-900">
                          <span className="font-medium">{comment.user.name}</span> commented on your post <span className="font-medium">"{post.title}"</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg">
                          "{comment.text}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No activity to show yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${userPosts.length > 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${userPosts.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Upload className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">First Post</h4>
                  </div>
                  <p className="text-sm text-gray-600">Create your first community issue report</p>
                  {userPosts.length > 0 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Completed on {new Date(userPosts[userPosts.length - 1].createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border ${userPosts.length >= 5 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${userPosts.length >= 5 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">Active Reporter</h4>
                  </div>
                  <p className="text-sm text-gray-600">Create at least 5 community issue reports</p>
                  {userPosts.length >= 5 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Completed!
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border ${userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <ThumbsUp className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">Community Support</h4>
                  </div>
                  <p className="text-sm text-gray-600">Receive 10 votes across all your posts</p>
                  {userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Completed with {userPosts.reduce((sum, post) => sum + post.votes.length, 0)} votes!
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border ${userPosts.filter(post => post.status === 'completed').length >= 1 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${userPosts.filter(post => post.status === 'completed').length >= 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">Problem Solver</h4>
                  </div>
                  <p className="text-sm text-gray-600">Have at least one of your reported issues resolved</p>
                  {userPosts.filter(post => post.status === 'completed').length >= 1 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Completed with {userPosts.filter(post => post.status === 'completed').length} resolved issues!
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border ${userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">Conversation Starter</h4>
                  </div>
                  <p className="text-sm text-gray-600">Receive 5 comments across all your posts</p>
                  {userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium">
                      Completed with {userPosts.reduce((sum, post) => sum + post.comments.length, 0)} comments!
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-50">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900">Community Champion</h4>
                  </div>
                  <p className="text-sm text-gray-600">Complete all other achievements</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {userPosts.length > 0 &&
                      userPosts.length >= 5 &&
                      userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 &&
                      userPosts.filter(post => post.status === 'completed').length >= 1 &&
                      userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 ? (
                      <span className="text-indigo-600 font-medium">Completed! You're a champion!</span>
                    ) : (
                      <span>Complete other achievements first</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;