namespace Coastline.Application.Services;

/// <summary>
/// Deliberate data-flow fixtures: multiple definitions of the same variable,
/// cross-method parameter passing, computational vs. predicate use, and an
/// unreachable-use branch. Exists to give All-Definition/All-Uses coverage
/// analyzers concrete def-use pairs to trace, not to model real behaviour.
/// </summary>
public static class DataFlowSampleService
{
    public record DiscountResult(string Tier, decimal DiscountRate, string? Note = null);

    /// <summary>
    /// <c>total</c> is defined three times (multiple-definitions handling) and
    /// used both computationally (the running sum) and as a predicate (the
    /// early-exit check).
    /// </summary>
    public static decimal AccumulateWithEarlyExit(IEnumerable<decimal> values, decimal ceiling)
    {
        decimal total = 0; // definition #1
        foreach (var v in values)
        {
            total = total + v; // definition #2
            if (total > ceiling) // predicate use
            {
                total = ceiling; // definition #3
                break;
            }
        }
        return total; // computational use
    }

    /// <summary>
    /// Passes a definition across a method boundary (cross-function use), and
    /// includes one branch whose assigned value is never read afterward
    /// (unreachable-use detection).
    /// </summary>
    public static DiscountResult DeriveMembershipDiscountTier(decimal annualSpend)
    {
        var tier = ClassifyTier(annualSpend); // cross-function definition
        decimal discountRate;
        if (tier == "gold")
        {
            discountRate = 0.15m;
        }
        else if (tier == "silver")
        {
            discountRate = 0.08m;
        }
        else
        {
            discountRate = 0; // reachable, never re-read on this path
            return new DiscountResult(tier, discountRate, "no discount applied");
        }
        return new DiscountResult(tier, discountRate);
    }

    private static string ClassifyTier(decimal annualSpend) =>
        annualSpend >= 2000 ? "gold" : annualSpend >= 800 ? "silver" : "standard";

    /// <summary>
    /// Multiple definitions of the same counter across nested loops, so
    /// Partial-Uses-Coverage and Coverage-Reporting-Validation checks have a
    /// realistic partially-covered method to measure.
    /// </summary>
    public static (bool[][] Adjacency, int EdgeCount) BuildAdjacencySample(int nodeCount)
    {
        var edgeCount = 0; // definition #1
        var adjacency = new bool[nodeCount][];
        for (var i = 0; i < nodeCount; i++)
        {
            var row = new bool[nodeCount];
            for (var j = 0; j < nodeCount; j++)
            {
                var connected = (i + j) % 3 == 0;
                row[j] = connected;
                if (connected)
                {
                    edgeCount = edgeCount + 1; // definition #2, uses prior value
                }
            }
            adjacency[i] = row;
        }
        return (adjacency, edgeCount);
    }
}
