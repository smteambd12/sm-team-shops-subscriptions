
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';

const UsersManagement = () => {
  const { users, loading } = useUsers();

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{user.full_name || 'No Name'}</h3>
                <p className="text-sm text-gray-600">{user.phone}</p>
                <p className="text-sm text-gray-500">Created: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-500">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
