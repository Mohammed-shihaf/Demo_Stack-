using Coastline.Application.Services;
using Xunit;

namespace Coastline.Tests;

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
    [InlineData(2, true, "premium", "priority-waitlist-group")]
    [InlineData(1, true, "premium", "priority-waitlist-single")]
    [InlineData(2, true, "standard", "standard-waitlist-group")]
    [InlineData(1, true, "standard", "standard-waitlist-single")]
    [InlineData(5, false, "premium", "confirm-group-premium")]
    [InlineData(2, false, "premium", "confirm-solo-premium")]
    [InlineData(5, false, "standard", "confirm-group-standard")]
    [InlineData(2, false, "standard", "confirm-solo-standard")]
    public void ClassifyBookingRequest_AllBranches(int classSizeRequested, bool isWaitlisted, string membershipTier, string expected)
    {
        Assert.Equal(expected, ControlFlowSampleService.ClassifyBookingRequest(classSizeRequested, isWaitlisted, membershipTier));
    }

    [Fact]
    public void ClassifyBookingRequest_RejectsNonPositiveSize()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            ControlFlowSampleService.ClassifyBookingRequest(0, false, "standard"));
    }
}
