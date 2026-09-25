using Estates.Web.Services;
using Xunit;

namespace Estates.Tests;

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
    [InlineData(6000, true, "commercial", "dispatch-contractor-commercial")]
    [InlineData(1000, true, "commercial", "dispatch-inhouse-commercial")]
    [InlineData(3000, true, "residential", "dispatch-contractor-residential")]
    [InlineData(500, true, "residential", "dispatch-inhouse-residential")]
    [InlineData(20000, false, "commercial", "approval-required-commercial")]
    [InlineData(1000, false, "commercial", "schedule-routine-commercial")]
    [InlineData(10000, false, "residential", "approval-required-residential")]
    [InlineData(500, false, "residential", "schedule-routine-residential")]
    public void ClassifyMaintenanceRequest_AllBranches(decimal estimatedCost, bool isEmergency, string propertyType, string expected)
    {
        Assert.Equal(expected, ControlFlowSampleService.ClassifyMaintenanceRequest(estimatedCost, isEmergency, propertyType));
    }

    [Fact]
    public void ClassifyMaintenanceRequest_RejectsNonPositiveCost()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            ControlFlowSampleService.ClassifyMaintenanceRequest(0, false, "residential"));
    }
}
