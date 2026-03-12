import { useState } from 'react'
import { Comment } from '@/types/provision'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, User } from 'lucide-react'

export function CommentSection({
  comments = [],
  provisionId,
  onAddComment
}: {
  comments?: Comment[]
  provisionId: string
  onAddComment: (body: string) => Promise<void>
}) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    await onAddComment(newComment)
    setNewComment("")
    setIsSubmitting(false)
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        Internal Discussion
        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-2">
          {comments.length}
        </span>
      </h3>

      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
              {comment.user.image ? (
                <img src={comment.user.image} alt={comment.user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-semibold text-sm text-gray-900">{comment.user.name || "Unknown"}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No discussion yet. Be the first to comment!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 relative">
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (use @ to mention)"
            className="w-full rounded-2xl border border-gray-200 shadow-sm px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
          />
        </div>
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="absolute bottom-3 right-3 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  )
}
