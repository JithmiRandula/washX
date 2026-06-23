using Laundry.DAL.Repositories;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.BLL.Services.Commerce;

public sealed class ReviewService(ReviewRepository repo)
{
    private readonly ReviewRepository _repo = repo;

    public async Task<(bool Success, string Message, int ReviewId)> AddReview(
        int orderId, int customerId, int providerId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            return (false, "Rating must be between 1 and 5.", 0);

        var canReview = await _repo.CanCustomerReview(orderId, customerId, providerId);
        if (!canReview)
            return (false, "This order is not yet completed or has already been reviewed.", 0);

        try
        {
            var review = new Review
            {
                OrderId    = orderId,
                CustomerId = customerId,
                ProviderId = providerId,
                Rating     = rating,
                Comment    = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim()
            };

            var reviewId = await _repo.AddReview(review);
            return reviewId > 0
                ? (true, "Review submitted successfully.", reviewId)
                : (false, "Failed to save the review.", 0);
        }
        catch (SqlException ex) when (ex.Number is 2627 or 2601)
        {
            return (false, "You have already submitted a review for this order.", 0);
        }
    }

    public Task<List<Review>> GetReviewsByProvider(int providerId) =>
        _repo.GetReviewsByProvider(providerId);

    public Task<RatingSummary> GetRatingSummary(int providerId) =>
        _repo.GetRatingSummary(providerId);

    public Task<List<ReviewableOrder>> GetReviewableOrders(int customerId) =>
        _repo.GetReviewableOrders(customerId);

    public Task<List<ProviderRating>> GetAllProviderRatings() =>
        _repo.GetAllProviderRatings();
}
