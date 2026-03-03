import { useState, useEffect, useCallback } from 'react';
import { commentApi } from '../api/comments';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ projectId, taskId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, isManager } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            let res;
            if (projectId) res = await commentApi.getProjectComments(projectId);
            else if (taskId) res = await commentApi.getTaskComments(taskId);

            if (res && res.comments) {
                setComments(res.comments);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    }, [projectId, taskId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            if (projectId) {
                await commentApi.addProjectComment(projectId, newComment);
            } else if (taskId) {
                await commentApi.addTaskComment(taskId, newComment);
            }
            setNewComment('');
            fetchComments(); // Refresh list
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await commentApi.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-600" />
                Discussion
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                            rows="2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end h-[46px]"
                    >
                        <Send size={18} />
                        <span className="cursor-pointer">Post</span>
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No comments yet. Start the conversation!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 group">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {comment.author_name.charAt(0).toUpperCase()}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100 relative">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900">{comment.author_name}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

                                {/* Delete button (Only author or manager) */}
                                {(isManager() || user?.id === comment.author_id) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete comment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
