import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, User, CheckCircle2, Circle, Filter, Search, Trash2, Edit3, Lock, LogOut, UserPlus, Clock, Users, Settings, Shield, Palette, Key, Save, X } from 'lucide-react';

export default function TodoTracker() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@csm.com', password: 'CSM2025!', name: 'Admin User', role: 'admin' }
  ]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);

  // Password reset state
  const [resetData, setResetData] = useState({ 
    email: '', 
    newPassword: '', 
    confirmPassword: '', 
    resetCode: '' 
  });
  const [resetMessage, setResetMessage] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState('');

  // Admin settings state
  const [appSettings, setAppSettings] = useState({
    dashboardTitle: 'Strategic CSM Task Dashboard',
    subtitle: 'Manage your customer success initiatives',
    primaryColor: '#2563eb', // blue-600
    accentColor: '#10b981', // green-500
    brandColor: '#7c3aed' // purple-600
  });

  // Admin management state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('settings');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(null);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // 5-minute auto-logout
  const TIMEOUT_DURATION = 300000;
  const WARNING_DURATION = 60000;

  const resetTimer = useCallback(() => {
    setTimeoutWarning(false);
    setTimeRemaining(300);
  }, []);

  const forceLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('login');
    setAuthError('Session expired due to inactivity');
    setTimeoutWarning(false);
    setTimeRemaining(300);
  }, []);

  useEffect(() => {
    let warningTimer;
    let logoutTimer;
    let countdownTimer;

    if (currentUser && currentPage === 'dashboard') {
      warningTimer = setTimeout(() => {
        setTimeoutWarning(true);
        setTimeRemaining(60);
        countdownTimer = setInterval(() => {
          setTimeRemaining(prev => prev <= 1 ? 0 : prev - 1);
        }, 1000);
      }, TIMEOUT_DURATION - WARNING_DURATION);

      logoutTimer = setTimeout(() => forceLogout(), TIMEOUT_DURATION);
    }

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
    };
  }, [currentUser, currentPage, forceLogout]);

  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      const resetTimerHandler = () => resetTimer();
      events.forEach(event => document.addEventListener(event, resetTimerHandler, true));
      return () => events.forEach(event => document.removeEventListener(event, resetTimerHandler, true));
    }
  }, [currentUser, currentPage, resetTimer]);

  const handleStayLoggedIn = () => resetTimer();

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      setLoginData({ email: '', password: '' });
    } else {
      setAuthError('Invalid email or password');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setAuthError('');
    if (signupData.password !== signupData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    if (signupData.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    if (users.find(u => u.email === signupData.email)) {
      setAuthError('An account with this email already exists');
      return;
    }
    const newUser = {
      id: Date.now(),
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
      role: 'user'
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentPage('dashboard');
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handlePasswordResetRequest = (e) => {
    e.preventDefault();
    setAuthError('');
    setResetMessage('');

    const user = users.find(u => u.email === resetData.email);
    if (!user) {
      setAuthError('No account found with this email address');
      return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(resetCode);
    setResetMessage(`A 6-digit reset code has been sent to ${resetData.email}. Please check your email and enter the code below.`);
    setCurrentPage('reset-confirm');
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setAuthError('');

    if (resetData.resetCode !== generatedResetCode) {
      setAuthError('Invalid reset code. Please check your email and try again.');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    if (resetData.newPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setUsers(users.map(user => 
      user.email === resetData.email 
        ? { ...user, password: resetData.newPassword }
        : user
    ));

    setResetMessage('Password updated successfully! You can now sign in with your new password.');
    setResetData({ email: '', newPassword: '', confirmPassword: '', resetCode: '' });
    setGeneratedResetCode('');
    
    setTimeout(() => {
      setCurrentPage('login');
      setResetMessage('');
    }, 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    setResetData({ email: '', newPassword: '', confirmPassword: '', resetCode: '' });
    setAuthError('');
    setResetMessage('');
    setGeneratedResetCode('');
    setTimeoutWarning(false);
    setTimeRemaining(300);
    setShowAdminPanel(false);
  };

  // Admin functions
  const isAdmin = () => currentUser?.role === 'admin';

  const handleSettingsSave = () => {
    alert('Settings saved successfully!');
  };

  const handleCreateUser = () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert('Please fill in all fields');
      return;
    }
    if (users.find(u => u.email === newUserData.email)) {
      alert('User with this email already exists');
      return;
    }
    const user = {
      id: Date.now(),
      ...newUserData
    };
    setUsers([...users, user]);
    setNewUserData({ name: '', email: '', password: '', role: 'user' });
    setShowUserModal(false);
    alert('User created successfully!');
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = () => {
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    alert('User updated successfully!');
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      alert('Cannot delete your own account');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleResetPasswordAction = () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (resetPasswordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setUsers(users.map(u => 
      u.id === showResetPassword.id 
        ? { ...u, password: resetPasswordData.newPassword }
        : u
    ));
    setShowResetPassword(null);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    alert('Password reset successfully!');
  };

  // Todo state
  const [todos, setTodos] = useState([
    {
      id: 1,
      userId: 1,
      assignedTo: 1,
      title: "Q4 Business Review Preparation",
      description: "Compile customer health metrics",
      priority: "High",
      category: "Enterprise Client",
      client: "TechCorp Industries",
      dueDate: "2025-09-15",
      status: "In Progress",
      completed: false
    },
    {
      id: 2,
      userId: 1,
      assignedTo: 1,
      title: "Renewal Strategy Meeting",
      description: "Discuss expansion opportunities",
      priority: "High",
      category: "Strategic",
      client: "Global Solutions Inc",
      dueDate: "2025-09-10",
      status: "Pending",
      completed: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General',
    client: '',
    dueDate: '',
    status: 'Pending',
    assignedTo: ''
  });

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Enterprise Client', 'Strategic', 'Training', 'General', 'Account Management', 'Onboarding'];
  const statuses = ['Pending', 'In Progress', 'Scheduled', 'Blocked', 'Review'];

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Scheduled': 'bg-purple-100 text-purple-700',
      'Blocked': 'bg-red-100 text-red-700',
      'Review': 'bg-amber-100 text-amber-700'
    };
    return colors[status] || colors.Pending;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const addTodo = () => {
    if (newTodo.title.trim()) {
      const todo = {
        id: Date.now(),
        userId: currentUser.id,
        assignedTo: newTodo.assignedTo || currentUser.id,
        ...newTodo,
        completed: false
      };
      setTodos([...todos, todo]);
      setNewTodo({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'General',
        client: '',
        dueDate: '',
        status: 'Pending',
        assignedTo: ''
      });
      setShowAddForm(false);
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodo = () => {
    if (editingTodo.title.trim()) {
      setTodos(todos.map(todo => todo.id === editingTodo.id ? editingTodo : todo));
      setEditingTodo(null);
    }
  };

  const userTodos = todos.filter(todo => todo.assignedTo === currentUser?.id || todo.userId === currentUser?.id);
  const uniqueClients = [...new Set(userTodos.map(todo => todo.client).filter(client => client && client.trim()))];
  
  const filteredTodos = userTodos.filter(todo => {
    const matchesFilter = filter === 'All' || 
                         (filter === 'Completed' && todo.completed) ||
                         (filter === 'Active' && !todo.completed) ||
                         todo.priority === filter ||
                         todo.category === filter ||
                         (filter.startsWith('Client: ') && todo.client === filter.replace('Client: ', ''));
    
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your CSM dashboard</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setCurrentPage('signup');
                  setAuthError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
            <p className="text-gray-600 mt-2">
              Forgot your password?{' '}
              <button
                onClick={() => {
                  setCurrentPage('reset-password');
                  setAuthError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset it
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'reset-password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive a reset code</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                value={resetData.email}
                onChange={(e) => setResetData({...resetData, email: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordResetRequest(e)}
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{resetMessage}</p>
              </div>
            )}

            <button
              onClick={handlePasswordResetRequest}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Send Reset Code
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setAuthError('');
                  setResetMessage('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'reset-confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Reset Code</h1>
            <p className="text-gray-600">Check your email for the 6-digit code and create a new password</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reset Code</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center font-mono text-lg"
                placeholder="Enter 6-digit code"
                maxLength="6"
                value={resetData.resetCode}
                onChange={(e) => setResetData({...resetData, resetCode: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter new password (min. 6 characters)"
                value={resetData.newPassword}
                onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm your new password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordReset(e)}
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{resetMessage}</p>
              </div>
            )}

            <button
              onClick={handlePasswordReset}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Reset Password
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={() => setCurrentPage('reset-password')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Resend code
              </button>
            </p>
            <p className="text-gray-600 mt-2 text-sm">
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setAuthError('');
                  setResetMessage('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to login
              </button>
            </p>
          </div>

          {generatedResetCode && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 mb-1">
                <strong>Development Mode:</strong> In production, the reset code would be sent to your email.
              </p>
              <p className="text-xs text-yellow-600">
                For testing: <span className="font-mono font-bold">{generatedResetCode}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the CSM dashboard platform</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Create a password (min. 6 characters)"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleSignup(e)}
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            <button
              onClick={handleSignup}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setAuthError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Prototype Notice Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-center mb-6">
        <p className="text-yellow-800 text-sm">
          <strong>Prototype Demo:</strong> Data resets on page refresh. 
          Login: admin@csm.com / CSM2025!
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ color: appSettings.primaryColor }}>
              {appSettings.dashboardTitle}
            </h1>
            <p className="text-gray-600">{appSettings.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{currentUser?.name}</span>
              {isAdmin() && (
                <span className="text-xs px-2 py-1 rounded" 
                      style={{ backgroundColor: `${appSettings.brandColor}20`, color: appSettings.brandColor }}>
                  Admin
                </span>
              )}
            </div>
            {isAdmin() && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-purple-50 rounded-lg transition-colors"
                style={{ color: appSettings.brandColor }}
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Tasks</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <optgroup label="Priority">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
                <optgroup label="Category">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </optgroup>
                <optgroup label="Clients">
                  {uniqueClients.map(client => (
                    <option key={client} value={`Client: ${client}`}>{client}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity"
            style={{ backgroundColor: appSettings.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{userTodos.filter(t => !t.completed).length}</div>
            <div className="text-sm text-gray-600">Active Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold" style={{ color: appSettings.accentColor }}>
              {userTodos.filter(t => t.completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{userTodos.filter(t => t.priority === 'High' || t.priority === 'Critical').length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{userTodos.filter(t => new Date(t.dueDate) < new Date()).length}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTodos.map(todo => (
            <div key={todo.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow ${todo.completed ? 'opacity-75' : ''}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleComplete(todo.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                      {todo.completed ? 
                        <CheckCircle2 className="w-5 h-5" style={{ color: appSettings.accentColor }} /> : 
                        <Circle className="w-5 h-5" />
                      }
                    </button>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTodo(todo)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className={`font-semibold text-gray-900 mb-2 ${todo.completed ? 'line-through' : ''}`}>
                  {todo.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">{todo.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{todo.client}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Assigned to: {getUserName(todo.assignedTo)}
                    </span>
                  </div>
                  
                  {todo.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {todo.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(todo.status)}`}>
                    {todo.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        )}
      </div>

      {/* All the modals continue here... */}
      {/* Admin Panel Modal */}
      {showAdminPanel && isAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" style={{ color: appSettings.brandColor }} />
                <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
              </div>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex">
              <div className="w-48 bg-gray-50 p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setAdminActiveTab('settings')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      adminActiveTab === 'settings' 
                        ? 'text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={adminActiveTab === 'settings' ? { backgroundColor: appSettings.brandColor } : {}}
                  >
                    <Palette className="w-4 h-4" />
                    App Settings
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('users')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      adminActiveTab === 'users' 
                        ? 'text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={adminActiveTab === 'users' ? { backgroundColor: appSettings.brandColor } : {}}
                  >
                    <Users className="w-4 h-4" />
                    User Management
                  </button>
                </nav>
              </div>

              <div className="flex-1 p-6 max-h-[70vh] overflow-y-auto">
                {adminActiveTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">App Settings</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Title</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={appSettings.dashboardTitle}
                        onChange={(e) => setAppSettings({...appSettings, dashboardTitle: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={appSettings.subtitle}
                        onChange={(e) => setAppSettings({...appSettings, subtitle: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            value={appSettings.primaryColor}
                            onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={appSettings.primaryColor}
                            onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            value={appSettings.accentColor}
                            onChange={(e) => setAppSettings({...appSettings, accentColor: e.target.value})}
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={appSettings.accentColor}
                            onChange={(e) => setAppSettings({...appSettings, accentColor: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            value={appSettings.brandColor}
                            onChange={(e) => setAppSettings({...appSettings, brandColor: e.target.value})}
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={appSettings.brandColor}
                            onChange={(e) => setAppSettings({...appSettings, brandColor: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSettingsSave}
                        className="text-white px-6 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity"
                        style={{ backgroundColor: appSettings.brandColor }}
                      >
                        <Save className="w-4 h-4" />
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'users' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity"
                        style={{ backgroundColor: appSettings.brandColor }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Add User
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  user.role === 'admin' ? 'text-white' : 'bg-gray-100 text-gray-800'
                                }`}
                                style={user.role === 'admin' ? { backgroundColor: appSettings.brandColor } : {}}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setShowResetPassword(user)}
                                    className="text-orange-600 hover:text-orange-800 text-sm transition-colors"
                                  >
                                    Reset Password
                                  </button>
                                  {user.id !== currentUser.id && (
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-800 text-sm transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              />
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateUser}
                className="flex-1 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: appSettings.brandColor }}
              >
                Create User
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={editingUser.id === currentUser.id}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: appSettings.brandColor }}
              >
                Update User
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password for {showResetPassword.name}</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleResetPasswordAction}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={() => setShowResetPassword(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeout Warning Modal */}
      {timeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expiring Soon</h3>
            <p className="text-gray-600 mb-4">
              You'll be logged out in <span className="font-bold text-orange-600">{timeRemaining}</span> seconds.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTodo.title}
                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
              />
              <input
                type="text"
                placeholder="Client name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTodo.client}
                onChange={(e) => setNewTodo({...newTodo, client: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                />
                <select
                  value={newTodo.status}
                  onChange={(e) => setNewTodo({...newTodo, status: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <select
                value={newTodo.assignedTo || currentUser.id}
                onChange={(e) => setNewTodo({...newTodo, assignedTo: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.id === currentUser.id ? '(Me)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addTodo}
                className="flex-1 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: appSettings.primaryColor }}
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingTodo.title}
                onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingTodo.description}
                onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
              />
              <input
                type="text"
                placeholder="Client name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingTodo.client}
                onChange={(e) => setEditingTodo({...editingTodo, client: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editingTodo.priority}
                  onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={editingTodo.category}
                  onChange={(e) => setEditingTodo({...editingTodo, category: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editingTodo.dueDate}
                  onChange={(e) => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                />
                <select
                  value={editingTodo.status}
                  onChange={(e) => setEditingTodo({...editingTodo, status: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <select
                value={editingTodo.assignedTo}
                onChange={(e) => setEditingTodo({...editingTodo, assignedTo: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.id === currentUser.id ? '(Me)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editCompleted"
                  className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                  style={{ accentColor: appSettings.accentColor }}
                  checked={editingTodo.completed}
                  onChange={(e) => setEditingTodo({...editingTodo, completed: e.target.checked})}
                />
                <label htmlFor="editCompleted" className="text-sm font-medium text-gray-700">
                  Mark as completed
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={updateTodo}
                className="flex-1 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: appSettings.primaryColor }}
              >
                Update Task
              </button>
              <button
                onClick={() => setEditingTodo(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}