import React, { useState, useEffect } from 'react';
import { PlusCircle, Heart, MessageCircle, Repeat, Edit2, Trash2, Loader } from 'lucide-react';
import { supabase } from './supabse';
import './App.css';

// Simulate a database with initial posts
const initialPosts = [
  {
    id: 1,
    content: "Hello world! This is my first post",
    author: "Deku",
    likes: 5,
    comments: 2,
    timestamp: "2024-11-12T10:00:00",
    },
  {
    id: 2,
    content: "React is awesome!",
    author: "User123",
    likes: 3,
    comments: 1,
    timestamp: "2024-11-12T11:30:00",
  },
];

const generateRandomUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;


const Post = ({ post, onLike, onEdit, onDelete, referencedPost }) => (
  <div className="post">
    <p>{post.content}</p>
    <p className="author">Author: {post.author}</p>
    <p className="timestamp">{new Date(post.timestamp).toLocaleString()}</p>
    {referencedPost && (
      <div className="referenced-post">
        <p>Reposted from:</p>
        <Post post={referencedPost} onLike={onLike} onEdit={onEdit} onDelete={onDelete} />
      </div>
    )}
    <div className="actions">
      <button onClick={() => onLike(post.id)}><Heart /> {post.likes}</button>
      <button onClick={() => onEdit(post.id)}><Edit2 /> Edit</button>
      <button onClick={() => onDelete(post.id)}><Trash2 /> Delete</button>
    </div>
  </div>
);
const handleRepost = async (postId) => {
  setLoading(true);
  try {
    const post = posts.find(post => post.id === postId);
    if (!post) {
      console.error('Post not found');
      setLoading(false);
      return;
    }

    const newPost = {
      content: post.content,
      author: currentUser,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
      repostedFrom: postId,
    };

    const { data, error } = await supabase
      .from('Posts')
      .insert(newPost)
      .select();

    if (error) {
      console.error('Error reposting:', error);
    } else {
      setPosts([data[0], ...posts]);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};

const handleFilterPosts = (flag) => {
  setLoading(true);
  try {
    const filteredPosts = posts.filter(post => post.flags.includes(flag));
    setPosts(filteredPosts);
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};



const App = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [currentUser, setCurrentUser] = useState("Deku");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [theme, setTheme] = useState("light");

// Create new post
const handleCreatePost = async (content) => {
  setLoading(true);
  try {
    const newPost = {
      content,
      author: currentUser,
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
    };

    const { error, data } = await supabase
      .from('Posts')
      .insert(newPost)
      .select();

    if (error) {
      console.error('Error creating post:', error);
    } else {
      setPosts([data[0], ...posts]);
      setShowCreateForm(false);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};

// Like post
const handleLikePost = async (postId) => {
  setLoading(true);
  try {
    // Find the post to like
    const post = posts.find(post => post.id === postId);
    if (!post) {
      console.error('Post not found');
      setLoading(false);
      return;
    }
    

    // Increment the likes count
    const updatedLikes = post.likes + 1;

    // Update the post in Supabase
    const { data, error } = await supabase
      .from('Posts')
      .update({ likes: updatedLikes })
      .eq('id', postId);

    if (error) {
      console.error('Error liking post:', error);
    } else {
      // Update the post in the state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: updatedLikes } : post
      ));
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};

const LoadingSpinner = () => (
  <div className="spinner"></div>
);

  // Delete post
const handleDeletePost = async (postId) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('Posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      setPosts(posts.filter(post => post.id !== postId));
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};

  // Edit post
  const handleEditPost = async (postId, newContent) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('Posts')
      .update({ content: newContent })
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, content: newContent } : post
      ));
      setEditingPost(null);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() =>{
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('Posts')
          .select('*');

        if (error) {
          console.error('Error fetching posts:', error);
        } else {
          setPosts(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchPosts();
  },
  []
);

  // Repost functionality
  const handleRepost = (originalPostId) => {
    setLoading(true);
    setTimeout(() => {
      const originalPost = posts.find(post => post.id === originalPostId);
      const newPost = {
        id: posts.length + 1,
        content: `Reposted: ${originalPost.content}`,
        author: currentUser,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
      };
      setPosts([newPost, ...posts]);
      setLoading(false);
    }, 500);
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Social Media App</h1>
          <div className="space-x-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              Toggle Theme
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
        >
          <PlusCircle size={20} />
          <span>Create Post</span>
        </button>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="max-w-4xl mx-auto mb-8">
          <CreatePostForm onSubmit={handleCreatePost} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader className="animate-spin text-white" size={48} />
        </div>
      )}

      {/* Posts Feed */}
      <div className={`max-w-4xl mx-auto ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            onLike={handleLikePost}
            post={post}
            currentUser={currentUser}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onRepost={handleRepost}
            isEditing={editingPost === post.id}
            setEditingPost={setEditingPost}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

// Create Post Form Component
const CreatePostForm = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };
  const handleRepost = async (postId) => {
    setLoading(true);
    try {
      const post = posts.find(post => post.id === postId);
      if (!post) {
        console.error('Post not found');
        setLoading(false);
        return;
      }

      const newPost = {
        content: post.content,
        author: currentUser,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        repostedFrom: postId,
      };

      const { data, error } = await supabase
        .from('Posts')
        .insert(newPost)
        .select();

      if (error) {
        console.error('Error reposting:', error);
      } else {
        setPosts([data[0], ...posts]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded mb-4 text-gray-900"
        placeholder="What's on your mind?"
        rows={4}
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
        >
          Post
        </button>
      </div>
    </form>
  );
};

// Post Card Component
const PostCard = ({
  post,
  currentUser,
  onDelete,
  onEdit,
  onRepost,
  isEditing,
  setEditingPost,
  theme,
  onLike,
}) => {
  const [editContent, setEditContent] = useState(post.content);
  const [liked, setLiked] = useState(false);

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(post.id, editContent);
    }
  };

  return (
    <div className={`rounded-lg shadow p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-gray-900"
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
            </div>
            {post.author === currentUser && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPost(post.id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <p className="mb-4">{post.content}</p>

          <div className="flex space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : ''}`}
            >
              <Heart size={16} />
              <span>{post.likes + (liked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center space-x-1">
              <MessageCircle size={16} />
              <span>{post.comments}</span>
            </button>
            <button
              onClick={() => onRepost(post.id)}
              className="flex items-center space-x-1"
            >
              <Repeat size={16} />
              <span>Repost</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;