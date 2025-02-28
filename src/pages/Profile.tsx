import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Loader, 
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
  Save
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
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
  const { userPosts, loading, error, fetchUserPosts, createPost } = usePosts();
  
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
    address: ''
  });
  const [activeTab, setActiveTab] = useState('posts');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    setUploading(true);
    try {
      // In a real app, we would upload the media file to a storage service
      // and get back a URL. For now, we'll use the preview URL or a placeholder
      const mediaUrl = previewUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop';
      
      await createPost({
        title,
        description,
        mediaUrl,
        mediaType: 'image',
        category,
        location: location || 'Unknown location'
      });
      
      setTitle('');
      setDescription('');
      setMedia(null);
      setPreviewUrl(null);
      setCategory('');
      setShowNewPost(false);
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
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-8">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowSettings(true)} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-6 w-6" />
                </button>
                <button onClick={logout} className="text-gray-600 hover:text-gray-900">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                alt={user?.name}
                className="h-24 w-24 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-2 flex space-x-6">
                  <div>
                    <span className="font-bold text-gray-900">{userPosts.length}</span>
                    <span className="ml-1 text-gray-600">posts</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">
                      {userPosts.reduce((sum, post) => sum + post.votes.length, 0)}
                    </span>
                    <span className="ml-1 text-gray-600">votes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="flex-1 px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    className="flex-1 px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    className="flex-1 px-3 py-2 focus:outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={userProfile.address}
                    onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                    className="flex-1 px-3 py-2 focus:outline-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveProfile}
              className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showNewPost ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Post</h2>
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
                          }
                        );
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
                  id="media-upload"
                  required
                />
                <label
                  htmlFor="media-upload"
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
                        Click to upload media
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Create Post'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowNewPost(true)}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 mb-8 flex items-center justify-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Create New Post
          </button>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>{error}</p>
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
            className={`py-2 px-4 font-medium ${
              activeTab === 'posts'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'activity'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity
          </button>
        </div>

        {activeTab === 'posts' ? (
          <>
            {/* Posts List View */}
            {userPosts.length > 0 ? (
              <div className="space-y-4 mb-8">
                {userPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        {post.mediaType === 'image' ? (
                          <img
                            src={post.mediaUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={post.mediaUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${getStatusColor(post.status)}`}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
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
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{post.votes.length} votes</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="text-gray-500 mt-2">Create your first post to get started</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            {userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post._id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                    <div className={`p-2 rounded-full ${getStatusColor(post.status)}`}>
                      {getStatusIcon(post.status)}
                    </div>
                    <div>
                      <p className="text-gray-900">
                        Your post <span className="font-medium">"{post.title}"</span> is now <span className="font-medium capitalize">{post.status.replace('_', ' ')}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
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
                      <p className="text-xs text-gray-500">
                        {new Date(new Date(post.createdAt).getTime() + index * 86400000).toLocaleString()}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;