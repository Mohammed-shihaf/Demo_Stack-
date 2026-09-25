using Awards.Web.Services;
using Xunit;

namespace Awards.Tests;

public class ControlFlowSampleServiceTests
{
    [Fact]
    public void ParseStrictInteger_EmptyInputPath()
    {
        var result = ControlFlowSampleService.ParseStrictInteger("");
        Assert.False(result.Ok);
        Assert.Equal("empty-input", result.Reason);
    }

    [Fact]
    public void ParseStrictInteger_NormalReturnPath()
    {
        var result = ControlFlowSampleService.ParseStrictInteger("42");
        Assert.True(result.Ok);
        Assert.Equal(42, result.Value);
    }

    [Fact]
    public void ParseStrictInteger_ExceptionPath()
    {
        var result = ControlFlowSampleService.ParseStrictInteger("not-a-number");
        Assert.False(result.Ok);
        Assert.Contains("Not an integer", result.Reason);
    }

    [Fact]
    public void SumUntilThreshold_ZeroIterations()
    {
        var result = ControlFlowSampleService.SumUntilThreshold(Array.Empty<decimal>(), 10m);
        Assert.Equal(0m, result.Sum);
        Assert.False(result.StoppedEarly);
        Assert.Equal(0, result.ItemsSeen);
    }

    [Fact]
    public void SumUntilThreshold_CompletesWithoutCrossingThreshold()
    {
        var result = ControlFlowSampleService.SumUntilThreshold(new[] { 1m, 2m, 3m }, 100m);
        Assert.Equal(6m, result.Sum);
        Assert.False(result.StoppedEarly);
    }

    [Fact]
    public void SumUntilThreshold_StopsEarly()
    {
        var result = ControlFlowSampleService.SumUntilThreshold(new[] { 10m, 10m, 10m, 10m }, 15m);
        Assert.True(result.StoppedEarly);
        Assert.True(result.Sum >= 15m);
    }

    [Theory]
    [InlineData(6000, true, "out-of-state", "expedited-emergency-oos")]
    [InlineData(1000, true, "out-of-state", "standard-emergency-oos")]
    [InlineData(15000, true, "in-state", "expedited-emergency-instate")]
    [InlineData(2000, true, "in-state", "standard-emergency-instate")]
    [InlineData(20000, false, "out-of-state", "review-required-oos")]
    [InlineData(1000, false, "out-of-state", "routine-oos")]
    [InlineData(30000, false, "in-state", "review-required-instate")]
    [InlineData(1000, false, "in-state", "routine-instate")]
    public void ClassifyDisbursementBatch_AllBranches(decimal amount, bool isEmergencyFund, string region, string expected)
    {
        Assert.Equal(expected, ControlFlowSampleService.ClassifyDisbursementBatch(amount, isEmergencyFund, region));
    }

    [Fact]
    public void ClassifyDisbursementBatch_RejectsNonPositiveAmount()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            ControlFlowSampleService.ClassifyDisbursementBatch(0, false, "in-state"));
    }
}
