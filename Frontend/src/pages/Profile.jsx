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
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          "https://elections-backend-j8m8.onrender.com/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(data.user);
        setProfileForm({
          name: data.user.name,
          email: data.user.email,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          navigate("/login");
        } else {
          toast.error("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    const { name, email } = profileForm;

    if (!name.trim() || !email.trim()) {
      return setErrors({
        name: !name.trim() ? "Name is required" : "",
        email: !email.trim() ? "Email is required" : "",
      });
    }

    try {
      const { data } = await axios.put(
        "https://elections-backend-j8m8.onrender.com/api/users/profile",
        { name, email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(data.user);
      toast.success("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrors({});

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "Current password required";
    if (!newPassword || newPassword.length < 6)
      newErrors.newPassword = "New password must be at least 6 characters";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      return setErrors(newErrors);
    }

    try {
      await axios.put(
        "https://elections-backend-j8m8.onrender.com/api/users/change-password",
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ currentPassword: "Incorrect current password" });
        toast.error("Incorrect current password");
      } else {
        toast.error("Failed to change password.");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    try {
      const { data } = await axios.post(
        "https://elections-backend-j8m8.onrender.com/api/users/profile/picture",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(data.user);
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Image upload failed.");
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) return <div className="p-10 text-center">No user found.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-20 p-4 bg-white shadow rounded-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-24 h-24">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
          )}
          <button
            onClick={triggerFileSelect}
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full"
            title="Upload"
          >
            <Camera size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <div className="flex items-center border px-3 rounded">
              <User className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="w-full py-2 px-2 outline-none"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label className="block">Email</label>
            <div className="flex items-center border px-3 rounded">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="w-full py-2 px-2 outline-none"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              type="button"
              className="bg-gray-300 px-4 py-2 rounded flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <Edit3 size={16} /> Edit Profile
        </button>
      )}

      <hr className="my-6" />

      <div>
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        {isChangingPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label>Current Password</label>
              <div className="flex items-center border px-3 rounded">
                <Lock size={16} />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full py-2 px-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm">{errors.currentPassword}</p>
              )}
            </div>
            <div>
              <label>New Password</label>
              <div className="flex items-center border px-3 rounded">
                <Lock size={16} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full py-2 px-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>
            <div>
              <label>Confirm New Password</label>
              <div className="flex items-center border px-3 rounded">
                <Lock size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full py-2 px-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Password
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
