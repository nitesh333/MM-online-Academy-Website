
import React, { useState } from 'react';
import { Plus, Trash2, Edit, FileUp, Bell, Package, Layout } from 'lucide-react';
import { Notification, SubCategory } from '../types';

interface AdminPanelProps {
  notifications: Notification[];
  categories: SubCategory[];
  onAddNotification: (n: Notification) => void;
  onDeleteNotification: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ notifications, categories, onAddNotification, onDeleteNotification }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'uploads'>('notifications');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bell className="h-4 w-4" /> Notifications
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout className="h-4 w-4" /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'uploads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileUp className="h-4 w-4" /> Media Uploads
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Manage Notifications</h3>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Add Notification
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase">
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Title</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          n.type === 'Result' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm font-medium text-gray-800">{n.title}</td>
                      <td className="py-4 px-2 text-sm text-gray-500">{n.date}</td>
                      <td className="py-4 px-2 text-right space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => onDeleteNotification(n.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-start hover:shadow-md transition-all">
                <div>
                  <h4 className="font-bold text-gray-800">{c.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{c.id.toUpperCase()}</p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                  <button className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            <button className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all">
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-xs font-bold uppercase">New Category</span>
            </button>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="max-w-xl mx-auto py-12 text-center">
            <div className="mb-6 p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 flex flex-col items-center">
              <FileUp className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-1">Upload Study Notes or Notifications</p>
              <p className="text-xs text-gray-400 mb-6">PDF, PNG, JPG up to 10MB</p>
              <label className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Choose Files
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
