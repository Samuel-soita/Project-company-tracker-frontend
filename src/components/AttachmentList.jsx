import { useState, useEffect, useRef, useCallback } from 'react';
import { attachmentApi } from '../api/attachments';
import { File, Upload, Trash2, Download, Paperclip, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AttachmentList = ({ projectId, taskId }) => {
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { user, isManager } = useAuth();

    const fetchAttachments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let res;
            if (projectId) res = await attachmentApi.getProjectAttachments(projectId);
            else if (taskId) res = await attachmentApi.getTaskAttachments(taskId);

            if (res && res.attachments) {
                setAttachments(res.attachments);
            }
        } catch (err) {
            console.error("Failed to fetch attachments", err);
            setError("Failed to load attachments.");
        } finally {
            setLoading(false);
        }
    }, [projectId, taskId]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation: 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            setError("File size exceeds 10MB limit.");
            return;
        }

        try {
            setUploading(true);
            setError(null);

            if (projectId) {
                await attachmentApi.addProjectAttachment(projectId, file);
            } else if (taskId) {
                await attachmentApi.addTaskAttachment(taskId, file);
            }

            fetchAttachments(); // refresh list
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload file. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const handleDelete = async (attachmentId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await attachmentApi.deleteAttachment(attachmentId);
            setAttachments(attachments.filter(a => a.id !== attachmentId));
        } catch (err) {
            console.error("Failed to delete attachment", err);
            setError("Failed to delete file.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Paperclip size={20} className="text-blue-600" />
                    Attachments
                </h3>

                {/* Upload Button */}
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.gif"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Upload size={16} />
                        )}
                        <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="animate-pulse flex gap-4">
                        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                ) : attachments.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                        <File size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">No files attached yet</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attachments.map(attachment => (
                            <li key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                                        <File size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={attachment.file_name}>
                                            {attachment.file_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {attachment.uploader_name} • {new Date(attachment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={attachment.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                                        title="View/Download"
                                    >
                                        <Eye size={16} />
                                    </a>

                                    {(isManager() || user?.id === attachment.uploader_id) && (
                                        <button
                                            onClick={() => handleDelete(attachment.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                                            title="Delete file"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AttachmentList;
