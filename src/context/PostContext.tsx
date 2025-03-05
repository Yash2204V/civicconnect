import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Define types
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
  post: string;
}

interface NewPost {
  title: string;
  description: string;
  media?: File;
  mediaType: 'image' | 'video';
  category: string;
  location: string;
}

interface PostContextType {
  posts: Post[];
  userPosts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  fetchUserPosts: () => Promise<void>;
  createPost: (postData: NewPost) => Promise<Post>;
  addComment: (postId: string, text: string) => Promise<Comment>;
  votePost: (postId: string) => Promise<Post>;
  updatePostStatus: (postId: string, status: Post['status']) => Promise<Post>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Set up axios defaults
  useEffect(() => {
    if (isAuthenticated && user) {
      axios.defaults.headers.common['Authorization'] = user._id;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [isAuthenticated, user]);

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/posts`);
      
      // Ensure all posts have the required fields
      const normalizedPosts = response.data.map((post: any) => ({
        ...post,
        category: post.category || 'Uncategorized',
        location: post.location || 'Unknown location',
        comments: post.comments || []
      }));
      
      setPosts(normalizedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    if (!isAuthenticated) {
      setUserPosts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/posts/user/me`);
      
      // Ensure all posts have the required fields
      const normalizedPosts = response.data.map((post: any) => ({
        ...post,
        category: post.category || 'Uncategorized',
        location: post.location || 'Unknown location',
        comments: post.comments || []
      }));
      
      setUserPosts(normalizedPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to fetch your posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData: NewPost): Promise<Post> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create a post');
    }

    setLoading(true);
    setError(null);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('description', postData.description);
      formData.append('mediaType', postData.mediaType);
      formData.append('category', postData.category);
      formData.append('location', postData.location);
      
      // Add media file if it exists
      if (postData.media) {
        formData.append('media', postData.media);
      }
      
      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Normalize the response to ensure it has all required fields
      const normalizedPost = {
        ...response.data,
        category: response.data.category || 'Uncategorized',
        location: response.data.location || 'Unknown location',
        comments: response.data.comments || []
      };
      
      // Update posts state with the new post
      setPosts(prevPosts => [normalizedPost, ...prevPosts]);
      
      // Update user posts if applicable
      setUserPosts(prevPosts => [normalizedPost, ...prevPosts]);
      
      return normalizedPost;
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, text: string): Promise<Comment> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to comment');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comment`, { text });
      
      // Update the posts state with the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), response.data]
            };
          }
          return post;
        })
      );
      
      // Update user posts if applicable
      setUserPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), response.data]
            };
          }
          return post;
        })
      );
      
      return response.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Vote on a post
  const votePost = async (postId: string): Promise<Post> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to vote');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/vote`);
      
      // Ensure the response has all required fields
      const normalizedPost = {
        ...response.data,
        category: response.data.category || 'Uncategorized',
        location: response.data.location || 'Unknown location',
        comments: response.data.comments || []
      };
      
      // Update the posts state with the updated post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? normalizedPost : post
        )
      );
      
      // Update user posts if applicable
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? normalizedPost : post
        )
      );
      
      return normalizedPost;
    } catch (err) {
      console.error('Error voting on post:', err);
      setError('Failed to vote on post. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update post status (admin only)
  const updatePostStatus = async (postId: string, status: Post['status']): Promise<Post> => {
    // For admin operations, we'll use the admin authentication from sessionStorage
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    if (!isAdminAuthenticated && (!isAuthenticated || user?.role !== 'admin')) {
      throw new Error('You must be an admin to update post status');
    }

    setLoading(true);
    setError(null);
    try {
      // Store the original authorization header
      const originalAuth = axios.defaults.headers.common['Authorization'];
      
      // Set admin authentication in headers for the API call
      if (isAdminAuthenticated) {
        axios.defaults.headers.common['Authorization'] = 'admin-user-id';
      }
      
      const response = await axios.patch(`${API_URL}/posts/${postId}/status`, { status });
      
      // Restore the original authorization header
      if (originalAuth) {
        axios.defaults.headers.common['Authorization'] = originalAuth;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      
      // Ensure the response has all required fields
      const normalizedPost = {
        ...response.data,
        category: response.data.category || 'Uncategorized',
        location: response.data.location || 'Unknown location',
        comments: response.data.comments || []
      };
      
      // Update the posts state with the updated post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? normalizedPost : post
        )
      );
      
      // Update user posts if applicable
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? normalizedPost : post
        )
      );
      
      return normalizedPost;
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Failed to update post status. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load posts on initial render
  useEffect(() => {
    fetchPosts();
  }, []);

  // Load user posts when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPosts();
    } else {
      setUserPosts([]);
    }
  }, [isAuthenticated]);

  return (
    <PostContext.Provider
      value={{
        posts,
        userPosts,
        loading,
        error,
        fetchPosts,
        fetchUserPosts,
        createPost,
        addComment,
        votePost,
        updatePostStatus
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};