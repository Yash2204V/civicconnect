import { useAuth } from '../context/AuthContext';
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
import { usePosts } from '../context/PostContext';
import ThemeToggle from '../components/ThemeToggle';

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
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    // Get user's location when creating a new post
    if (showNewPost && navigator.geolocation) {
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


  // -------------------------------------------------
  const handleUpdatePost = async () => {
    if (!editingPostId) return;

    try {
      if (!title || !description || !category || !media) return;

      // Determine media type from file
      let mediaType = 'image';
      if (media && media.type.startsWith('video/')) {
        mediaType = 'video';
      }

      await updatePost(editingPostId, {
        title,
        description,
        media: media || undefined,
        mediaType: mediaType as 'image' | 'video',
        category,
        location: location || 'Unknown location'
      });


      setShowNewPost(false);
      setEditingPostId(null);
      // Reset form
      setTitle('');
      setMedia(null);
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
    setMedia(post.media);
    setPreviewUrl(post.mediaUrl);
    setShowNewPost(true);
  };

  // -------------------------------------------------

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

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern dark:bg-gray-900 dark:bg-dot-pattern-dark">
      {/* Header */}
      <div className="bg-white bg-opacity-90 backdrop-blur-md border-b shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/dashboard"
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex space-x-4">
                <ThemeToggle />
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="relative">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden dark:bg-gradient-primary-dark">
                  {profileImage ? (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-indigo-300 dark:text-indigo-200" />
                      <img src={profileImage} alt={user?.name} className="w-full h-full object-cover" />
                    </>
                  ) : (
                    user?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <Camera className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h1>
                <p className="text-gray-600 flex items-center dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </p>
                <p className="text-gray-600 flex items-center dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-1" />
                  {user?.phone}
                </p>
                <p className="text-gray-600 flex items-center dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user?.address}
                </p>

                <div className="mt-3">
                  {isEditingBio ? (
                    <div className="flex flex-col space-y-2">
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="input-primary h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Write something about yourself..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <p className="text-gray-700 text-sm dark:text-gray-300">
                        {userProfile.bio || "No bio yet. Click to add one."}
                      </p>
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                    >
                      <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
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
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md m-4 dark:bg-gray-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Name
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                    <div className="bg-gray-100 p-3 dark:bg-gray-700">
                      <User className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Email
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                    <div className="bg-gray-100 p-3 dark:bg-gray-700">
                      <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                    <div className="bg-gray-100 p-3 dark:bg-gray-700">
                      <Phone className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Address
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                    <div className="bg-gray-100 p-3 dark:bg-gray-700">
                      <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      value={userProfile.address}
                      onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                      className="flex-1 px-3 py-2 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    rows={3}
                    placeholder="Write something about yourself..."
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full mt-6 btn-primary flex items-center justify-center dark:bg-indigo-700 dark:hover:bg-indigo-600"
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
              className="bg-white rounded-xl p-6 max-w-md w-full dark:bg-gray-800"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3 dark:bg-red-200">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-700" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2 dark:text-gray-100">
                Delete Post
              </h3>
              <p className="text-gray-500 text-center mb-6 dark:text-gray-400">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => postToDelete && handleDeletePost()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
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
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-screen overflow-y-auto dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingPostId ? 'Edit Post' : 'New Post'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setEditingPostId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                  Media (Image or Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="media"
                />
                <label
                  htmlFor="media"
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-indigo-200 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200 dark:border-indigo-700 dark:hover:border-indigo-600"
                >
                  {previewUrl ? (
                    <div className="text-center">
                      <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-indigo-300 dark:text-indigo-400" />
                      <p className="mt-2 text-sm text-indigo-500 dark:text-indigo-400">
                        Click to upload media (optional)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setEditingPostId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-600"
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
              className="bg-white rounded-xl shadow-md p-6 mb-8 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Post</h2>
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setTitle('');
                    setDescription('');
                    setMedia(null);
                    setPreviewUrl(null);
                    setCategory('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Location
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input-primary rounded-r-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder="Location of the issue"
                      required
                    />
                    <button
                      type="button"
                      className="bg-indigo-100 text-indigo-600 px-3 rounded-r-lg border border-l-0 border-gray-200 hover:bg-indigo-200 transition-colors duration-200 dark:bg-indigo-700 dark:text-indigo-100 dark:border-gray-600 dark:hover:bg-indigo-600"
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
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    rows={4}
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">
                    Media (Image or Video)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                    id="media"
                  />
                  <label
                    htmlFor="media"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-indigo-200 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200 dark:border-indigo-700 dark:hover:border-indigo-600"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-indigo-300 dark:text-indigo-400" />
                        <p className="mt-2 text-sm text-indigo-500 dark:text-indigo-400">
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
                    className="flex-1 btn-primary dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
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
                    className="flex-1 btn-secondary dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <></>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 dark:bg-red-900 dark:border-red-800 dark:text-red-100">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => fetchUserPosts()}
              className="mt-2 text-sm font-medium underline dark:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-6 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'posts'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            My Posts
            {activeTab === 'posts' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'activity'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            Activity
            {activeTab === 'activity' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 px-4 font-medium relative ${activeTab === 'achievements'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            Achievements
            {activeTab === 'achievements' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
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
                      className="bg-white rounded-xl shadow-sm overflow-hidden card-hover dark:bg-gray-800"
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
                          </div>
                        )}


                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{post.title}</h3>
                            <div className='flex gap-4 justify-center items-center'>
                              <div className="flex space-x-1 justify-center items-center mt-2 gap-2">
                                <button
                                  onClick={() => handleDeleteClick(post._id)}
                                  className="p-1.5 bg-white bg-opacity-80 rounded-full text-red-500 hover:text-red-700 hover:bg-opacity-100 transition-colors duration-200 shadow-sm dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="p-1.5 bg-white bg-opacity-80 rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-opacity-100 transition-colors duration-200 shadow-sm dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                              <span className={`status-badge ${getStatusClass(post.status)} dark:bg-gray-200`}>
                                {getStatusIcon(post.status)}
                                <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                              </span>
                            </div>
                          </div>

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

                          <p className="text-gray-600 text-sm mb-3 dark:text-gray-300">{post.description}</p>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between border-t pt-3 dark:border-gray-700">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-gray-500 text-sm dark:text-gray-400">
                                  <ThumbsUp className="h-4 w-4 mr-1 text-indigo-500 dark:text-indigo-400" />
                                  <span>{post.votes.length} votes</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm dark:text-gray-400">
                                  <MessageCircle className="h-4 w-4 mr-1 text-indigo-500 dark:text-indigo-400" />
                                  <span>{post.comments.length} comments</span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex mt-3">
                              <button
                                onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center dark:text-indigo-400 dark:hover:text-indigo-300"
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
                                  className="mt-3 pt-3 border-t dark:border-gray-700"
                                >
                                  <h4 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Comments</h4>
                                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {post.comments && post.comments.length > 0 ? (
                                      <div className="space-y-3">
                                        {post.comments.map((comment) => (
                                          <div key={comment._id} className="flex space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 dark:bg-gradient-secondary-dark">
                                              {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                  {comment.user.name}
                                                </p>
                                                <p className="text-gray-700 text-sm dark:text-gray-300">{comment.text}</p>
                                              </div>
                                              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                                {new Date(comment.createdAt).toLocaleString(undefined, {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 text-sm dark:text-gray-400">No comments yet.</p>
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
                <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-gray-800">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-32 w-32 rounded-full bg-indigo-100 animate-pulse-slow dark:bg-indigo-900"></div>
                      </div>
                      <AlertTriangle className="h-16 w-16 text-indigo-400 mx-auto relative z-10 dark:text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">No posts yet</h3>
                    <p className="text-gray-500 mb-6 dark:text-gray-400">Create your first post to get started</p>
                    {/* <button
                  onClick={() => setShowNewPost(true)}
                  className="btn-primary mx-auto dark:bg-indigo-700 dark:hover:bg-indigo-600"
                >
                  Create Post
                </button> */}
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
              className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">Recent Activity</h3>

              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className={`p-2 rounded-full ${getStatusClass(post.status)} dark:bg-gray-700`}>
                        {getStatusIcon(post.status)}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-gray-100">
                          Your post <span className="font-medium">"{post.title}"</span> is now{' '}
                          <span className="font-medium capitalize">{post.status.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {userPosts.flatMap((post) =>
                    post.votes.map((vote, index) => (
                      <div
                        key={`${post._id}-vote-${index}`}
                        className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="p-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900">
                          <ThumbsUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-gray-100">
                            Someone voted on your post <span className="font-medium">"{post.title}"</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                            {new Date(new Date(post.createdAt).getTime() + index * 86400000).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {userPosts.flatMap((post) =>
                    post.comments.map((comment, index) => (
                      <div
                        key={`${post._id}-comment-${index}`}
                        className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="p-2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">{comment.user.name}</span> commented on your post{' '}
                            <span className="font-medium">"{post.title}"</span>
                          </p>
                          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg dark:bg-gray-700 dark:text-gray-300">
                            "{comment.text}"
                          </p>
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No activity to show yet</p>
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
              className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">Your Achievements</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border ${userPosts.length > 0
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900'
                    : 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-full ${userPosts.length > 0
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <Upload className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">First Post</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Create your first community issue report</p>
                  {userPosts.length > 0 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium dark:text-indigo-400">
                      Completed on{' '}
                      {new Date(userPosts[userPosts.length - 1].createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border ${userPosts.length >= 5
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900'
                    : 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-full ${userPosts.length >= 5
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">Active Reporter</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Create at least 5 community issue reports</p>
                  {userPosts.length >= 5 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium dark:text-indigo-400">Completed!</div>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border ${userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900'
                    : 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-full ${userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">Community Support</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive 10 votes across all your posts</p>
                  {userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium dark:text-indigo-400">
                      Completed with {userPosts.reduce((sum, post) => sum + post.votes.length, 0)} votes!
                    </div>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border ${userPosts.filter((post) => post.status === 'completed').length >= 1
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900'
                    : 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-full ${userPosts.filter((post) => post.status === 'completed').length >= 1
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">Problem Solver</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Have at least one of your reported issues resolved</p>
                  {userPosts.filter((post) => post.status === 'completed').length >= 1 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium dark:text-indigo-400">
                      Completed with {userPosts.filter((post) => post.status === 'completed').length} resolved issues!
                    </div>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl border ${userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900'
                    : 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-full ${userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">Conversation Starter</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive 5 comments across all your posts</p>
                  {userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 && (
                    <div className="mt-2 text-xs text-indigo-600 font-medium dark:text-indigo-400">
                      Completed with {userPosts.reduce((sum, post) => sum + post.comments.length, 0)} comments!
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300">
                      <Award className="h-5 w-5" />
                    </div>
                    <h4 className="ml-2 font-medium text-gray-900 dark:text-gray-100">Community Champion</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Complete all other achievements</p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {userPosts.length > 0 &&
                      userPosts.length >= 5 &&
                      userPosts.reduce((sum, post) => sum + post.votes.length, 0) >= 10 &&
                      userPosts.filter((post) => post.status === 'completed').length >= 1 &&
                      userPosts.reduce((sum, post) => sum + post.comments.length, 0) >= 5 ? (
                      <span className="text-indigo-600 font-medium dark:text-indigo-400">
                        Completed! You're a champion!
                      </span>
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