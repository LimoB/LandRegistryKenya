import React from "react";
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation, type User } from "../../features/users/userApi";
import { useAppDispatch } from "../../app/hooks";
import { setSelectedUser, openEditModal } from "../../features/users/userSlice";
import { 
  Users, 
  ShieldCheck, 
  UserCog, 
  Trash2, 
  BadgeCheck,
  Mail} from "lucide-react";

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure? This will revoke all access for this user.")) {
      await deleteUser(id);
    }
  };

  const toggleVerification = async (user: User) => {
    await updateUser({ 
      id: user.id, 
      payload: { isVerified: !user.isVerified } 
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={32} /> User Directory
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter mt-1">
            System-wide identity and permission management
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800">
          <ShieldCheck className="text-blue-600" size={18} />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Administrator Level Access</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-100 dark:border-slate-900">
              <th className="px-8 py-5">Identity</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Wallet Address</th>
              <th className="px-8 py-5 text-right">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {isLoading ? (
              <tr><td colSpan={5} className="py-20 text-center animate-pulse font-bold text-slate-400 uppercase text-xs">Decrypting User Records...</td></tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-xs">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{user.fullName}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold mt-0.5">
                          <span className="flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                      user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' :
                      user.role === 'land_officer' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => toggleVerification(user)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                      user.isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      <BadgeCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                    </button>
                  </td>
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-400">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { dispatch(setSelectedUser(user)); dispatch(openEditModal()); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                      >
                        <UserCog size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;