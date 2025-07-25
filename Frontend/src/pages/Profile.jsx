import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = ({ onLogout }) => {
  const token = localStorage.getItem("userToken");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(
          "https://elections-backend-j8m8.onrender.com/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [onLogout, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Unable to load user profile. Please login again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              No Image
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
        
        </form>
      </div>
    </div>
  );
};

export default Profile;
