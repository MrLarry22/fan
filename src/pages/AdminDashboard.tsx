import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Upload, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Crown,
  BarChart3,
  Heart,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  FileVideo,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Creator, Content } from '../lib/supabase';
import AdminMessaging from '../components/Admin/AdminMessaging';


interface AdminStats {
  totalCreators: number;
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

interface CreatorFormData {
  display_name: string;
  bio: string;
  location: string;
  avatar_file: File | null;
  banner_file: File | null;
  total_subscribers: number;
  total_likes: number;
  media_count: number;
}

interface ContentFormData {
  title: string;
  description: string;
  content_file: File | null;
  content_type: 'image' | 'video' | 'text';
  is_premium: boolean;
}

const CreatorAvatar: React.FC<{ creator: Creator; size?: 'small' | 'large'; className?: string }> = ({ creator, size = 'small', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const sizeClasses = size === 'large' ? 'w-32 h-32' : 'w-16 h-16';
  const textSize = size === 'large' ? 'text-3xl' : 'text-xl';
  
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };
  
  const handleImageError = () => {
    console.log(`Failed to load avatar for ${creator.display_name}:`, creator.avatar_url);
    setImageLoading(false);
    setImageError(true);
  };
  
  return (
    <div className={`${sizeClasses} bg-blue-600 rounded-full flex items-center justify-center overflow-hidden relative ${className}`}>
      {creator.avatar_url && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={creator.avatar_url}
            alt={creator.display_name}
            className={`${sizeClasses} object-cover rounded-full ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <span className={`text-white ${textSize} font-bold`}>
          {creator.display_name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'content' | 'users' | 'revenue' | 'messages'>('creators');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalCreators: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateCreator, setShowCreateCreator] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [editingCreator, setEditingCreator] = useState<string | null>(null);
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const [newCreator, setNewCreator] = useState<CreatorFormData>({
    display_name: '',
    bio: '',
    location: '',
    avatar_file: null,
    banner_file: null,
    total_subscribers: 0,
    total_likes: 0,
    media_count: 0
  });

  const [newContent, setNewContent] = useState<ContentFormData>({
    title: '',
    description: '',
    content_file: null,
    content_type: 'image',
    is_premium: true
  });

  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [selectedCreatorUserId, setSelectedCreatorUserId] = useState<string>('');

  // File preview states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch creators
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false });

      if (creatorsError) throw creatorsError;
      
      // Debug: Log creator data to see avatar URLs
      console.log('Fetched creators:', creatorsData);
      creatorsData?.forEach(creator => {
        console.log(`Creator ${creator.display_name}: avatar_url = ${creator.avatar_url}`);
      });
      
      setCreators(creatorsData || []);

      // Fetch content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          creators (display_name)
        `)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;
      setContent(contentData || []);

      // Calculate stats
      const totalRevenue = 0; // Will be calculated from subscriptions
      const activeSubscriptions = 0; // Will be calculated from subscriptions

      setStats({
        totalCreators: creatorsData?.length || 0,
        totalUsers: 0, // Will be calculated from profiles
        totalRevenue,
        activeSubscriptions
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // File upload helper function
  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      // Check if storage is available
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Storage not available:', bucketsError);
        return null;
      }

      // Check if specific bucket exists
      const bucketExists = buckets?.some(b => b.name === bucket);
      if (!bucketExists) {
        console.error(`Storage bucket '${bucket}' does not exist`);
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // Handle file selection with preview
  const handleFileSelect = (
    file: File, 
    type: 'avatar' | 'banner' | 'content',
    setPreview: (url: string | null) => void
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

const handleCreateCreator = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setUploadingFiles(true);
  
  try {
    // Validate required fields
    if (!newCreator.display_name.trim()) {
      throw new Error('Display name is required');
    }

    if (!newCreator.avatar_file) {
      throw new Error('Profile picture is required for creator accounts');
    }

    // Check if backend is running
    try {
      const healthCheck = await fetch('http://localhost:3001/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!healthCheck.ok) {
        throw new Error('Backend server is not running. Please start the server on port 3001.');
      }
      const healthData = await healthCheck.json();
      console.log('Backend health check:', healthData);
    } catch (err) {
      console.error('Health check failed:', err);
      throw new Error('Cannot connect to backend server. Make sure the server is running on port 3001');
    }

    // For now, we'll create a simple creator without full auth flow
    // You'll need to set up proper admin authentication later
    
    // Create FormData for multipart upload
    const formData = new FormData();
    const uniqueEmail = `creator_${Date.now()}@fanview.local`;
    formData.append('email', uniqueEmail);
    formData.append('fullName', newCreator.display_name);
    formData.append('displayName', newCreator.display_name);
    formData.append('bio', newCreator.bio || '');
    formData.append('location', newCreator.location || '');
    formData.append('total_subscribers', newCreator.total_subscribers.toString());
    formData.append('total_likes', newCreator.total_likes.toString());
    formData.append('media_count', newCreator.media_count.toString());
    formData.append('avatar', newCreator.avatar_file); // Avatar file upload
    
    // Add banner file if provided
    if (newCreator.banner_file) {
      formData.append('banner', newCreator.banner_file);
    }

    console.log('Sending request to:', 'http://localhost:3001/api/admin/creators/provision');
    console.log('FormData contents:', {
      email: uniqueEmail,
      fullName: newCreator.display_name,
      displayName: newCreator.display_name,
      bio: newCreator.bio || '',
      location: newCreator.location || '',
      avatar: newCreator.avatar_file?.name,
      banner: newCreator.banner_file?.name || 'None'
    });

    // Call the backend test provision endpoint (temporarily without auth for testing)
    const response = await fetch('http://localhost:3001/api/admin/creators/provision-test', {
      method: 'POST',
      headers: {
        // No auth needed for test endpoint
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('Backend response:', result);
    console.log('Creator data received:', result.data.creator);
    
    if (!result.success) {
      throw new Error(result.message || 'Creator creation failed');
    }

    // Add the new creator to the list
    setCreators([result.data.creator, ...creators]);
    
    // Reset form
    setNewCreator({
      display_name: '',
      bio: '',
      location: '',
      avatar_file: null,
      banner_file: null,
      total_subscribers: 0,
      total_likes: 0,
      media_count: 0
    });
    setAvatarPreview(null);
    setBannerPreview(null);
    setShowCreateCreator(false);
    
    const bannerText = result.data.creator.banner_url ? ' and banner' : '';
    alert(`Creator "${result.data.creator.display_name}" created successfully with avatar${bannerText}!`);
    
    // Refresh the creators list
    fetchAdminData();
    
  } catch (error) {
    console.error('Error creating creator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`Error creating creator: ${errorMessage}`);
  } finally {
    setLoading(false);
    setUploadingFiles(false);
  }
};

  const handleUpdateCreator = async (creatorId: string, updates: Partial<CreatorFormData>) => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .update({
          display_name: updates.display_name,
          bio: updates.bio,
          location: updates.location,
          total_subscribers: updates.total_subscribers,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId)
        .select()
        .single();

      if (error) throw error;

      setCreators(creators.map(c => c.id === creatorId ? data : c));
      setEditingCreator(null);
      alert('Creator updated successfully!');
    } catch (error) {
      console.error('Error updating creator:', error);
      alert('Error updating creator. Please try again.');
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) {
      alert('Please select a creator first.');
      return;
    }

    if (!selectedCreatorUserId) {
      alert('Selected creator does not have a valid user ID. Please try another creator or recreate this creator account.');
      return;
    }

    if (!newContent.content_file) {
      alert('Please select a file to upload.');
      return;
    }

    setUploadingFiles(true);

    try {
      // Check if backend is running
      try {
        const healthCheck = await fetch('http://localhost:3001/health');
        if (!healthCheck.ok) {
          throw new Error('Backend server is not running. Please start the server on port 3001.');
        }
      } catch {
        throw new Error('Cannot connect to backend server. Make sure the server is running on port 3001');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('userId', selectedCreatorUserId); // Send user ID instead of creator ID
      formData.append('title', newContent.title);
      formData.append('description', newContent.description || '');
      formData.append('isPremium', newContent.is_premium.toString());
      formData.append('contentFile', newContent.content_file);

      console.log('Uploading content for creator with user ID:', selectedCreatorUserId);
      console.log('Selected creator database ID:', selectedCreatorId);

      // Call the backend content upload endpoint
      const response = await fetch('http://localhost:3001/api/content/upload', {
        method: 'POST',
        headers: {
          // Will add auth header later when authentication is properly set up
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const resultText = await response.text();
      console.log('Success response text:', resultText);
      const result = JSON.parse(resultText);
      
      if (!result.success) {
        throw new Error(result.message || 'Content upload failed');
      }

      // Add the new content to the list
      setContent([result.data, ...content]);
      
      // Update creator's media count using the selectedCreatorId (database ID)
      const creator = creators.find(c => c.id === selectedCreatorId);
      if (creator) {
        await handleUpdateCreator(selectedCreatorId, {
          ...creator,
          media_count: (creator.media_count || 0) + 1
        });
      }

      setNewContent({
        title: '',
        description: '',
        content_file: null,
        content_type: 'image',
        is_premium: true
      });
      setContentPreview(null);
      setSelectedCreatorId('');
      setSelectedCreatorUserId('');
      setShowAddContent(false);
      alert('Content added successfully!');
    } catch (error) {
      console.error('Error adding content:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        selectedCreatorId,
        selectedCreatorUserId,
        title: newContent.title,
        contentType: newContent.content_type,
        hasFile: !!newContent.content_file
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error adding content: ${errorMessage}\n\nCheck the console for more details.`);
    } finally {
      setUploadingFiles(false);
    }
  };

  const generateShareableLink = (creatorId: string, displayName: string) => {
    const slug = displayName.toLowerCase().replace(/\s+/g, '-');
    return `${window.location.origin}/creator/${slug}`;
  };

  const handleCreatorSelection = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    
    // Find the selected creator and set the user ID
    const selectedCreator = creators.find(creator => creator.id === creatorId);
    if (selectedCreator && selectedCreator.user_id) {
      setSelectedCreatorUserId(selectedCreator.user_id);
    } else {
      setSelectedCreatorUserId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Crown className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-white font-poppins">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-400">
            Manage creators, content, and platform analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Creators</p>
                <p className="text-2xl font-bold text-white">{stats.totalCreators}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Content</p>
                <p className="text-2xl font-bold text-white">{content.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800 rounded-xl p-1 mb-8 border border-slate-700">
          <div className="flex space-x-1">
            {[
              { id: 'creators', label: 'Creators', icon: Users },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'overview', label: 'Overview', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'overview' | 'creators' | 'content' | 'users' | 'revenue' | 'messages')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Creators Tab */}
        {activeTab === 'creators' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white font-poppins">Manage Creators</h2>
              <button
                onClick={() => setShowCreateCreator(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Creator</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {creators.map((creator) => (
                <div key={creator.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Creator Header */}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <CreatorAvatar creator={creator} size="large" className="flex-shrink-0" />
                        <div className="flex-1">
                          {/* <img src="../../server/uploads/creators/ertt-3428/avatar.png" alt=""/> */}
                          <h3 className="text-white font-semibold text-lg">{creator.display_name}</h3>
                          <p className="text-slate-400 text-sm">{creator.total_subscribers} subscribers</p>
                          {creator.location && (
                            <p className="text-slate-500 text-xs">{creator.location}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-slate-400 text-sm flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {creator.total_likes || 0} likes
                            </span>
                            <span className="text-slate-400 text-sm flex items-center">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              {creator.media_count || 0} media
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCreator(editingCreator === creator.id ? null : creator.id)}
                          className="bg-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setExpandedCreator(expandedCreator === creator.id ? null : creator.id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {expandedCreator === creator.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Creator Bio */}
                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                      {creator.bio || 'No bio available'}
                    </p>

                    {/* Creator Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold">
                        ${creator.total_revenue} earned
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        creator.is_active 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {creator.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingCreator === creator.id && (
                    <div className="border-t border-slate-700 p-6 bg-slate-750">
                      <h4 className="text-white font-semibold mb-4">Edit Creator</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        handleUpdateCreator(creator.id, {
                          display_name: formData.get('display_name') as string,
                          bio: formData.get('bio') as string,
                          location: formData.get('location') as string,
                          total_subscribers: parseInt(formData.get('total_subscribers') as string) || 0,
                          total_likes: parseInt(formData.get('total_likes') as string) || 0,
                          media_count: parseInt(formData.get('media_count') as string) || 0,
                        });
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                            <input
                              type="text"
                              name="display_name"
                              defaultValue={creator.display_name}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Subscribers</label>
                            <input
                              type="number"
                              name="total_subscribers"
                              defaultValue={creator.total_subscribers}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                          <textarea
                            name="bio"
                            defaultValue={creator.bio || ''}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                          <input
                            type="text"
                            name="location"
                            defaultValue={creator.location || ''}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., New York, USA"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Total Likes</label>
                            <input
                              type="number"
                              name="total_likes"
                              defaultValue={creator.total_likes || 0}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Media Count</label>
                            <input
                              type="number"
                              name="media_count"
                              defaultValue={creator.media_count || 0}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCreator(null)}
                            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedCreator === creator.id && (
                    <div className="border-t border-slate-700 p-6 bg-slate-750">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Picture Preview */}
                        <div>
                          <h5 className="text-white font-medium mb-2">Profile Picture</h5>
                          <CreatorAvatar creator={creator} size="large" className="border border-slate-600" />
                        </div>
                        
                        {/* Banner Preview */}
                        <div>
                          <h5 className="text-white font-medium mb-2">Banner</h5>
                          {creator.banner_url ? (
                            <img
                              src={creator.banner_url}
                              alt="Banner"
                              className="w-full h-24 object-cover rounded-lg border border-slate-600"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg border border-slate-600 flex items-center justify-center">
                              <span className="text-white text-sm">Default gradient banner</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            const link = generateShareableLink(creator.id, creator.display_name);
                            navigator.clipboard.writeText(link);
                            alert('Creator link copied to clipboard!');
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>Copy Creator Link</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white font-poppins">Content Management</h2>
              <button
                onClick={() => setShowAddContent(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                  <div className="aspect-video bg-slate-700 flex items-center justify-center">
                    {item.content_type === 'image' && item.content_url ? (
                      <img
                        src={item.content_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.content_type === 'video' && item.content_url ? (
                      <video
                        src={item.content_url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                    ) : (
                      <div className="text-slate-400">
                        {item.content_type === 'video' ? (
                          <Video className="w-8 h-8" />
                        ) : (
                          <FileText className="w-8 h-8" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">
                      by {item.creators?.display_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.is_premium 
                          ? 'bg-yellow-600/20 text-yellow-400' 
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {item.is_premium ? 'Premium' : 'Free'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-slate-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && <AdminMessaging />}

        {/* Create Creator Modal */}
        {showCreateCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-8 w-full max-w-3xl mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white font-poppins">Add New Creator</h2>
                <button
                  onClick={() => {
                    setShowCreateCreator(false);
                    setAvatarPreview(null);
                    setBannerPreview(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCreator} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={newCreator.display_name}
                      onChange={(e) => setNewCreator({...newCreator, display_name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Initial Subscribers
                    </label>
                    <input
                      type="number"
                      value={newCreator.total_subscribers}
                      onChange={(e) => setNewCreator({...newCreator, total_subscribers: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio Details
                  </label>
                  <textarea
                    value={newCreator.bio}
                    onChange={(e) => setNewCreator({...newCreator, bio: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Tell us about this creator..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newCreator.location}
                    onChange={(e) => setNewCreator({...newCreator, location: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., New York, USA"
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Picture Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Profile Picture *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCreator({...newCreator, avatar_file: file});
                          if (file) {
                            handleFileSelect(file, 'avatar', setAvatarPreview);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                      />
                      <p className="text-slate-500 text-xs">
                        Profile picture is required for all creator accounts
                      </p>
                      {avatarPreview && (
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Preview:</p>
                          <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-slate-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Profile Banner (Optional)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewCreator({...newCreator, banner_file: file});
                          if (file) {
                            handleFileSelect(file, 'banner', setBannerPreview);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                      />
                      <p className="text-slate-500 text-xs">
                        Leave empty to use gradient banner
                      </p>
                      {bannerPreview && (
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Preview:</p>
                          <img
                            src={bannerPreview}
                            alt="Banner Preview"
                            className="w-full h-20 object-cover rounded-lg border border-slate-600"
                          />
                        </div>
                      )}
                      {!bannerPreview && (
                        <div className="text-slate-500 text-xs mt-2">
                          <div className="w-full h-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-slate-600 flex items-center justify-center">
                            <span className="text-slate-400 text-xs">Default gradient will be used</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Initial Likes
                    </label>
                    <input
                      type="number"
                      value={newCreator.total_likes}
                      onChange={(e) => setNewCreator({...newCreator, total_likes: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Initial Media Count
                    </label>
                    <input
                      type="number"
                      value={newCreator.media_count}
                      onChange={(e) => setNewCreator({...newCreator, media_count: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCreator(false);
                      setAvatarPreview(null);
                      setBannerPreview(null);
                    }}
                    className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFiles}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploadingFiles ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Creator</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Content Modal */}
        {showAddContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white font-poppins">Upload Content</h2>
                <button
                  onClick={() => {
                    setShowAddContent(false);
                    setContentPreview(null);
                    setSelectedCreatorId('');
                    setSelectedCreatorUserId('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddContent} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Creator *
                  </label>
                  <select
                    value={selectedCreatorId}
                    onChange={(e) => handleCreatorSelection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a creator...</option>
                    {creators.map((creator) => (
                      <option key={creator.id} value={creator.id}>
                        {creator.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Creator's User ID (Auto-filled)
                  </label>
                  <input
                    type="text"
                    value={selectedCreatorUserId}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-300 cursor-not-allowed"
                    placeholder="Auto-filled when creator is selected"
                    disabled
                    readOnly
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    This is the user_id from the creators table that will be used to link content
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newContent.title}
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Content Type *
                    </label>
                    <select
                      value={newContent.content_type}
                      onChange={(e) => setNewContent({...newContent, content_type: e.target.value as 'image' | 'video' | 'text'})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe this content..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload {newContent.content_type === 'image' ? 'Picture' : newContent.content_type === 'video' ? 'Video' : 'File'} *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept={newContent.content_type === 'image' ? 'image/*' : newContent.content_type === 'video' ? 'video/*' : '*/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewContent({...newContent, content_file: file});
                        if (file && (newContent.content_type === 'image' || newContent.content_type === 'video')) {
                          handleFileSelect(file, 'content', setContentPreview);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                      required
                    />
                    
                    {/* File Preview */}
                    {contentPreview && newContent.content_type === 'image' && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Preview:</p>
                        <img
                          src={contentPreview}
                          alt="Content Preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600"
                        />
                      </div>
                    )}
                    
                    {contentPreview && newContent.content_type === 'video' && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Preview:</p>
                        <video
                          src={contentPreview}
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600"
                          controls
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={newContent.is_premium}
                    onChange={(e) => setNewContent({...newContent, is_premium: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_premium" className="text-slate-300">
                    Premium Content (requires subscription)
                  </label>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddContent(false);
                      setContentPreview(null);
                      setSelectedCreatorId('');
                      setSelectedCreatorUserId('');
                    }}
                    className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFiles}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploadingFiles ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Content</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}