using Coastline.Application.Services;
using Xunit;

namespace Coastline.Tests;

public class DataFlowSampleServiceTests
{
    [Fact]
    public void AccumulateWithEarlyExit_StopsAtCeiling()
    {
        Assert.Equal(45m, DataFlowSampleService.AccumulateWithEarlyExit(new[] { 10m, 20m, 30m, 40m }, 45m));
    }

    [Fact]
    public void AccumulateWithEarlyExit_SumsWithoutHittingCeiling()
    {
        Assert.Equal(6m, DataFlowSampleService.AccumulateWithEarlyExit(new[] { 1m, 2m, 3m }, 100m));
    }

    [Fact]
    public void DeriveMembershipDiscountTier_Gold()
    {
        var result = DataFlowSampleService.DeriveMembershipDiscountTier(2500m);
        Assert.Equal("gold", result.Tier);
        Assert.Equal(0.15m, result.DiscountRate);
    }

    [Fact]
    public void DeriveMembershipDiscountTier_Silver()
    {
        var result = DataFlowSampleService.DeriveMembershipDiscountTier(1000m);
        Assert.Equal("silver", result.Tier);
        Assert.Equal(0.08m, result.DiscountRate);
    }

    [Fact]
    public void DeriveMembershipDiscountTier_StandardReturnsEarlyWithNoDiscount()
    {
        var result = DataFlowSampleService.DeriveMembershipDiscountTier(100m);
        Assert.Equal("standard", result.Tier);
        Assert.Equal(0m, result.DiscountRate);
        Assert.Equal("no discount applied", result.Note);
    }

    [Fact]
    public void BuildAdjacencySample_CountsConnectedEdges()
    {
        var (adjacency, edgeCount) = DataFlowSampleService.BuildAdjacencySample(4);
        Assert.Equal(4, adjacency.Length);
        Assert.True(edgeCount > 0);
    }

    [Fact]
    public void BuildAdjacencySample_EmptyWhenNodeCountIsZero()
    {
        var (adjacency, edgeCount) = DataFlowSampleService.BuildAdjacencySample(0);
        Assert.Empty(adjacency);
        Assert.Equal(0, edgeCount);
    }
}
