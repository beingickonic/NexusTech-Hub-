import React, { useState, useEffect, useCallback } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Plus, Filter, FileText, Image as ImageIcon, File, MoreVertical, Download, Eye, Trash2, FolderOpen, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('image/')) return <ImageIcon size={24} className="text-blue-500" />;
  if (mimeType?.includes('pdf')) return <FileText size={24} className="text-red-500" />;
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return <File size={24} className="text-green-500" />;
  return <File size={24} className="text-slate-500" />;
};

const RecordKeepingPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data } = await officeService.getDocuments();
      setDocuments(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading(`Uploading ${file.name}...`);
    try {
      const metadata = {
        title: file.name.split('.')[0],
        category: 'General',
        visibility: 'Internal'
      };
      const { data } = await officeService.uploadDocument(file, metadata);
      setDocuments([data, ...documents]);
      toast.success('Document uploaded successfully', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Upload failed. Check database permissions.', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, path) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await officeService.deleteDocument(id, path);
      setDocuments(documents.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => 
    (doc.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doc.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Record Keeping</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage company documents securely with version control and visibility settings.</p>
        </div>
        <div className="relative">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          <label 
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/30 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <UploadCloud size={18} />}
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </label>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative w-full sm:max-w-md">
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 hidden md:table-cell">Category</th>
                <th className="px-6 py-4 hidden sm:table-cell">Size</th>
                <th className="px-6 py-4 hidden lg:table-cell">Visibility</th>
                <th className="px-6 py-4 hidden xl:table-cell">Uploaded By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <FolderOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No documents found</p>
                    <p className="text-sm mt-1">Upload a file to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {getFileIcon(doc.mime_type)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{doc.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex gap-2">
                            <span>v{doc.version}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium">
                        {doc.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-slate-600 dark:text-slate-400">
                      {formatBytes(doc.file_size)}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        doc.visibility === 'Public' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                        doc.visibility === 'Confidential' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                      }`}>
                        {doc.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-slate-600 dark:text-slate-400">
                      {doc.uploader?.full_name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Preview">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors" title="Download">
                          <Download size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc.id, doc.file_path)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
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
    </div>
  );
};

export default RecordKeepingPage;
