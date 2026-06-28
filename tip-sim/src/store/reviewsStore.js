import { create } from 'zustand'

const KEY = 'tip_reviews'
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
function save(r) { localStorage.setItem(KEY, JSON.stringify(r)) }

export const useReviewsStore = create((set, get) => ({
  reviews: load(),

  submitReview: (data) => {
    const review = {
      id: 'rev_' + Date.now(),
      createdAt: new Date().toISOString(),
      ...data,
    }
    const reviews = [review, ...get().reviews]
    save(reviews)
    set({ reviews })
    return review
  },

  getPendingReviews: (userId) => {
    // Returns service IDs that need a review
    return []
  },

  getReviewsForUser: (userId) => get().reviews.filter(r => r.reviewedId === userId),
}))
