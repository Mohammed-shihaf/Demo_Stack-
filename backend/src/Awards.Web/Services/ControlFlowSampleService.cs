namespace Awards.Web.Services;

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
    public static string ClassifyDisbursementBatch(decimal amount, bool isEmergencyFund, string region)
    {
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "amount must be positive");
        }
        if (isEmergencyFund)
        {
            if (region == "out-of-state")
            {
                return amount > 5000 ? "expedited-emergency-oos" : "standard-emergency-oos";
            }
            return amount > 10000 ? "expedited-emergency-instate" : "standard-emergency-instate";
        }
        if (region == "out-of-state")
        {
            return amount > 15000 ? "review-required-oos" : "routine-oos";
        }
        return amount > 25000 ? "review-required-instate" : "routine-instate";
    }
}
