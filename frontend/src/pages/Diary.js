import React, { useState, useEffect } from 'react';
import { diaryAPI } from '../utils/api';
import { BookOpen, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('month');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    mood: 'okay',
    emoji: '😐',
    textColor: '#374151',
    textSize: 16,
    image: ''
  });

  useEffect(() => {
    fetchEntries();
  }, [selectedDate, selectedMonth, selectedYear, filterType]);

  const fetchEntries = async () => {
    try {
      const params = {};
      if (filterType === 'date') {
        params.date = selectedDate;
      } else {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      const response = await diaryAPI.getAll(params);
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to fetch diary entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.content.trim()) {
      toast.error('Please write some content for your diary entry');
      return;
    }
    
    try {
      console.log('Submitting diary entry:', formData);
      
      if (editingEntry) {
        await diaryAPI.update(editingEntry._id, formData);
        toast.success('Entry updated successfully! ✨');
      } else {
        await diaryAPI.create(formData);
        toast.success('Entry created successfully! 🎉');
      }
      
      setShowModal(false);
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        content: '',
        mood: 'okay',
        emoji: '😐',
        textColor: '#374151',
        textSize: 16,
        image: ''
      });
      setImageSize(300);
      setShowImageResize(false);
      fetchEntries();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      if (errorMessage.includes('already exists')) {
        toast.error('Entry for this date already exists! 📅');
      } else if (errorMessage.includes('required')) {
        toast.error('Please fill in all required fields');
      } else if (errorMessage.includes('Validation')) {
        toast.error('Please check your input data');
      } else {
        toast.error(`Failed to save entry: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date.split('T')[0],
      content: entry.content,
      mood: entry.mood,
      emoji: entry.emoji || '😐',
      textColor: entry.textColor || '#374151',
      textSize: entry.textSize || 16,
      image: entry.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await diaryAPI.delete(id);
        toast.success('Entry deleted successfully');
        fetchEntries();
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const allEmojis = [
    '😄', '😊', '😍', '😘', '😗', '😙', '😚', '🙂', '🥰', '😌',
    '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '🙁', '😥', '😢',
    '😭', '😱', '😨', '😰', '😩', '😬', '😐', '😑', '😶', '🙄',
    '🤔', '🤫', '🤭', '🥱', '😴', '🤤', '😂', '😉', '😆', '😅',
    '😁', '😃', '🤣', '😇', '🙃', '😉', '😊', '🚇', '🤗', '🤭',
    '😡', '😠', '🤬', '😤', '😣', '😖', '😕', '😮', '😯', '😦',
    '😧', '😲', '😵', '🤐', '🥴', '🤢', '🤮', '🤥', '🤧', '😷',
    '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '💀', '☠️',
    '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼',
    '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜',
    '🤍', '🖤', '🤎', '💝', '💘', '💖', '💗', '💓', '💞', '💕',
    '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '💯', '💢', '💥', '💫', '💦',
    '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💯', '🎉', '🎊', '🎈', '🎇',
    '🎆', '🎅', '🎄', '🎁', '🎀', '🎎', '🎍', '🎌', '🎋', '🌿',
    '🌾', '🌽', '🌼', '🌻', '🌺', '🌹', '🌷', '💐', '🌸', '🌵'
  ];
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const colors = ['#374151', '#dc2626', '#2563eb', '#059669', '#7c3aed', '#ea580c', '#be185d', '#f59e0b', '#10b981', '#8b5cf6'];

  const [imageSize, setImageSize] = useState(300);
  const [showImageResize, setShowImageResize] = useState(false);

  const resizeImage = (file, maxWidth) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedImage = await resizeImage(file, imageSize);
      setFormData({ ...formData, image: resizedImage });
      setShowImageResize(true);
    }
  };

  const handleImageResize = async (newSize) => {
    if (formData.image) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const ratio = Math.min(newSize / img.width, newSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = formData.image;
    }
    setImageSize(newSize);
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      excellent: '😄',
      good: '😊',
      okay: '😐',
      bad: '😞',
      terrible: '😢'
    };
    return moods[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      okay: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      bad: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      terrible: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[mood] || colors.okay;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Diary</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </button>
        </div>

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4 flex-wrap">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">By Date</option>
              <option value="month">By Month</option>
            </select>
            
            {filterType === 'date' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2025 - i} value={2025 - i}>
                      {2025 - i}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-6">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{entry.emoji || getMoodEmoji(entry.mood)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                        {entry.mood}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {entry.image && (
                  <div className="mb-4">
                    <img src={entry.image} alt="Diary entry" className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap" style={{ color: entry.textColor || '#374151', fontSize: `${entry.textSize || 16}px` }}>
                    {entry.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {filterType === 'date' 
                  ? `No diary entry for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `No diary entries for ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                }
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  {editingEntry ? '✏️ Edit Entry' : '📝 New Diary Entry'}
                </h2>
                <div className="text-3xl">{formData.emoji}</div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Mood Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🎭 Mood
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => {
                        const newMood = e.target.value;
                        setFormData({ 
                          ...formData, 
                          mood: newMood,
                          emoji: moodEmojis[newMood]?.[0] || getMoodEmoji(newMood)
                        });
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    >
                      <option value="excellent">😄 Excellent</option>
                      <option value="good">😊 Good</option>
                      <option value="okay">😐 Okay</option>
                      <option value="bad">😞 Bad</option>
                      <option value="terrible">😢 Terrible</option>
                    </select>
                  </div>
                </div>

                {/* Emoji and Image Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Emoji Picker */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      😊 Choose Emoji
                    </label>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                          {formData.emoji}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-primary-500 transition-all"
                        >
                          {showEmojiPicker ? 'Close' : 'Pick Emoji'}
                        </button>
                      </div>
                      
                      {showEmojiPicker && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-inner max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-8 gap-1">
                            {allEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, emoji });
                                  setShowEmojiPicker(false);
                                }}
                                className={`text-lg p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                  formData.emoji === emoji ? 'bg-primary-100 dark:bg-primary-900' : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      📸 Add Image
                    </label>
                    <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl border-2 border-dashed border-pink-200 dark:border-gray-500">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      {formData.image ? (
                        <div className="space-y-2">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="flex gap-2">
                            <label htmlFor="image-upload" className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded text-center cursor-pointer hover:bg-blue-600">
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="cursor-pointer block text-center py-4">
                          <div className="text-2xl mb-1">📷</div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Click to upload</p>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color and Size Template */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Color Picker */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🎨 Text Color
                    </label>
                    <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border-2 border-dashed border-pink-200 dark:border-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          className="w-16 h-16 rounded-xl border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                        />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose any color</p>
                          <p className="text-xs text-gray-500 mt-1">{formData.textColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Size */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      📏 Text Size: {formData.textSize}px
                    </label>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-500">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        step="1"
                        value={formData.textSize}
                        onChange={(e) => setFormData({ ...formData, textSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[12, 14, 16, 18, 20, 22, 24].map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, textSize: size })}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              formData.textSize === size 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>



                {/* Content */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ✍️ Your Story
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                      style={{ color: formData.textColor, fontSize: `${formData.textSize}px`, fontFamily: 'Georgia, serif' }}
                      rows="6"
                      placeholder="Write about your day... ✨"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {formData.content.length} characters
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEntry(null);
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        content: '',
                        mood: 'okay',
                        emoji: '😐',
                        textColor: '#374151',
                        textSize: 16,
                        image: ''
                      });
                      setImageSize(300);
                      setShowImageResize(false);
                    }}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {editingEntry ? '💾 Update Entry' : '✨ Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;