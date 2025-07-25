import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Lock,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Camera,
  Calendar,
  Clock,
  Shield,
  Settings,
  LogOut
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(
          "https://elections-backend-j8m8.onrender.com/api/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Optionally handle the error (e.g., redirect to login)
        if (error.response?.status === 401 && onLogout) {
          onLogout();
        }
      }
      setLoading(false);
    })();
  }, [onLogout, token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    const errs = {};
    if (!profileForm.name.trim()) errs.name = "Name is required";
    if (profileForm.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!profileForm.email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) errs.email = "Enter a valid email";
    if (Object.keys(errs).length) return setErrors(errs);
    setUpdateLoading(true);
    try {
      const { data } = await axios.put(
        "https://elections-backend-j8m8.onrender.com/api/users/profile",
        {
          name: profileForm.name.trim(),
          email: profileForm.email.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data.user);
      localStorage.setItem("userData", JSON.stringify(data.user));
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update profile.";
      setErrors({ general: msg });
      toast.error(msg);
    }
    setUpdateLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    const errs = {};
    if (!passwordForm.currentPassword) errs.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) errs.newPassword = "New password is required";
    if (passwordForm.newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) return setErrors(errs);
    setPasswordLoading(true);
    try {
      await axios.put(
        "https://elections-backend-j8m8.onrender.com/api/users/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ currentPassword: "Current password is incorrect" });
        toast.error("Current password is incorrect");
      } else {
        const msg = error.response?.data?.message || "Failed to change password.";
        setErrors({ general: msg });
        toast.error(msg);
      }
    }
    setPasswordLoading(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);

    // show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUser(prev => ({ ...prev, profilePicture: ev.target.result }));
    };
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append("image", file);
    try {
      const { data } = await axios.post(
        "https://elections-backend-j8m8.onrender.com/api/users/profile/picture",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data.user);
      localStorage.setItem("userData", JSON.stringify(data.user));
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload image.");
    }
    setImageLoading(false);
  };

  const triggerImageSelect = () => fileInputRef.current?.click();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    if (onLogout) onLogout();
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").toUpperCase() : "U";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-64 h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Show error state if user data couldn't be loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load profile</h2>
          <p className="text-gray-600 mb-6">Please try refreshing the page or logging in again.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and personal information</p>
        </div>
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-800 font-medium">{errors.general}</p>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white relative flex items-center gap-6 group">
                <div className="relative">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <button
                    onClick={triggerImageSelect}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    {imageLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={24} className="text-white" />
                    )}
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
                  <p className="text-blue-100 mb-2">{user.email}</p>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Shield size={16} />
                    <span className="text-sm">Verified Account</span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-300"
                    >
                      <Edit3 size={18} /> Edit Profile
                    </button>
                  )}
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-300 ${
                          isEditing ? "border-gray-200 focus:border-blue-400 bg-white" : "border-gray-100 bg-gray-50 text-gray-600"
                        } ${errors.name ? "border-red-300" : ""}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl transition-all duration-300 ${
                          isEditing ? "border-gray-200 focus:border-blue-400 bg-white" : "border-gray-100 bg-gray-50 text-gray-600"
                        } ${errors.email ? "border-red-300" : ""}`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {updateLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (<><Save size={18} />Save Changes</>)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileForm({ name: user.name, email: user.email });
                          setErrors({});
                        }}
                        disabled={updateLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                      >
                        <X size={18} /> Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h3>
                    <p className="text-gray-600 text-sm">Manage your password and account security</p>
                  </div>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all duration-300"
                    >
                      <Lock size={18} /> Change Password
                    </button>
                  )}
                </div>
                {isChangingPassword && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-300 ${
                            errors.currentPassword ? "border-red-300" : "border-gray-200"
                          } focus:border-blue-400`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-300 ${
                            errors.newPassword ? "border-red-300" : "border-gray-200"
                          } focus:border-blue-400`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-300 ${
                            errors.confirmPassword ? "border-red-300" : "border-gray-200"
                          } focus:border-blue-400`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {passwordLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (<><Save size={18} />Update Password</>)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setErrors({});
                        }}
                        disabled={passwordLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                      >
                        <X size={18} /> Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-semibold text-gray-900">{formatDate(user.createdAt).split(",")[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="text-green-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last login</p>
                    <p className="font-semibold text-gray-900">{formatDate(user.lastLogin).split(" at ")[1] || "Just now"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="text-white" size={16} />
                </div>
                <h3 className="font-semibold text-green-800">Account Secure</h3>
              </div>
              <p className="text-green-700 text-sm">Your account is protected with strong security measures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;