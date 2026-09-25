namespace Coastline.Application.Services;

/// <summary>
/// Deliberate control-flow fixtures: exception paths, loop paths with zero
/// and multiple iterations, and a multi-branch method -- for path/branch
/// coverage and cyclomatic/cognitive complexity metrics.
/// </summary>
public static class ControlFlowSampleService
{
    public record ParseResult(bool Ok, int? Value = null, string? Reason = null);

    /// <summary>
    /// Three distinct exit paths: empty-input short-circuit, normal return,
    /// and a caught exception -- for exception-path handling and
    /// multi-function path tracking.
    /// </summary>
    public static ParseResult ParseStrictInteger(string? raw)
    {
        if (string.IsNullOrEmpty(raw))
        {
            return new ParseResult(false, Reason: "empty-input"); // path 1
        }
        try
        {
            if (!int.TryParse(raw, out var n))
            {
                throw new FormatException($"Not an integer: {raw}");
            }
            return new ParseResult(true, Value: n); // path 2
        }
        catch (FormatException ex)
        {
            return new ParseResult(false, Reason: ex.Message); // path 3
        }
    }

    public record SumResult(decimal Sum, bool StoppedEarly, int ItemsSeen);

    /// <summary>
    /// Loop body may run zero, one, or many times depending on input -- for
    /// loop-path detection and complete-coverage-path verification.
    /// </summary>
    public static SumResult SumUntilThreshold(IReadOnlyList<decimal> values, decimal threshold)
    {
        decimal sum = 0;
        var stoppedEarly = false;
        for (var i = 0; i < values.Count; i++)
        {
            sum += values[i];
            if (sum >= threshold)
            {
                stoppedEarly = true;
                break;
            }
        }
        return new SumResult(sum, stoppedEarly, values.Count);
    }

    /// <summary>
    /// Nested conditionals with real branching depth, for cyclomatic/cognitive
    /// complexity metrics.
    /// </summary>
    public static string ClassifyBookingRequest(int classSizeRequested, bool isWaitlisted, string membershipTier)
    {
        if (classSizeRequested <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(classSizeRequested), "classSizeRequested must be positive");
        }
        if (isWaitlisted)
        {
            if (membershipTier == "premium")
            {
                return classSizeRequested > 1 ? "priority-waitlist-group" : "priority-waitlist-single";
            }
            return classSizeRequested > 1 ? "standard-waitlist-group" : "standard-waitlist-single";
        }
        if (membershipTier == "premium")
        {
            return classSizeRequested > 4 ? "confirm-group-premium" : "confirm-solo-premium";
        }
        return classSizeRequested > 4 ? "confirm-group-standard" : "confirm-solo-standard";
    }
}
