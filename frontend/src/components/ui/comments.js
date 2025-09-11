import React, { useState } from 'react';
import { MessageCircle, Reply, Send, Heart, User } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

const CommentForm = ({ onSubmit, parentId = null, placeholder = "Write a comment...", loading = false }) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSubmit({ content: content.trim(), parent_id: parentId });
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!user) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <p className="text-gray-600">Please log in to leave a comment</p>
          <Button className="mt-2" size="sm">Log In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {content.length}/500 characters
            </span>
            <Button 
              type="submit" 
              size="sm"
              disabled={!content.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const Comment = ({ comment, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const handleReply = async (replyData) => {
    setReplyLoading(true);
    try {
      await onReply({ ...replyData, parent_id: comment.id });
      setShowReplyForm(false);
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const marginLeft = Math.min(depth * 24, 96); // Max 4 levels deep

  return (
    <div className="space-y-3" style={{ marginLeft: `${marginLeft}px` }}>
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(comment.user_name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">{comment.user_name || 'Anonymous'}</span>
                <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                {!comment.is_approved && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Pending approval
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReplyForm && (
        <div className="ml-8">
          <CommentForm
            onSubmit={handleReply}
            parentId={comment.id}
            placeholder="Write a reply..."
            loading={replyLoading}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsSection = ({
  comments = [],
  onAddComment,
  onLoadMore,
  hasMore = false,
  loading = false,
  title = "Comments"
}) => {
  const [commentLoading, setCommentLoading] = useState(false);

  const handleAddComment = async (commentData) => {
    setCommentLoading(true);
    try {
      await onAddComment(commentData);
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          {title} ({comments.length})
        </h3>
      </div>

      <CommentForm onSubmit={handleAddComment} loading={commentLoading} />

      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
            <p className="text-gray-600">Be the first to share your thoughts!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleAddComment}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Load More Comments'}
          </Button>
        </div>
      )}
    </div>
  );
};

export { CommentsSection, CommentForm, Comment };