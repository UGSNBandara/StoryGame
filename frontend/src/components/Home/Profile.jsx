import React from 'react';

function Profile({ user }) {
  return (
    <div className="parchment md:col-span-2">
      <h2 className="font-display text-xl mb-2">Explorer Profile</h2>
      <div className="text-sm space-y-1">
        <div><span className="font-semibold">User ID:</span> {user.id}</div>
        <div><span className="font-semibold">Email:</span> {user.email}</div>
        <div><span className="font-semibold">Username:</span> {user.username}</div>
      </div>
    </div>
  );
}

export default Profile;