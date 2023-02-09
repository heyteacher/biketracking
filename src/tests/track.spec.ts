import { LiveTrack } from "~/app/models/LiveTrack";
import { Track } from "~/app/models/Track";
import { ClimbDownHillAccumulator } from "~/app/models/types";
const timeseries = require("timeseries-analysis");

const track: Track = require('./track_sample.json')

// A sample Jasmine test
describe("Track", () => {
  it("contains locations", () => {
    expect(track.locations.length).toBeGreaterThan(0);
  });
});

// A sample Jasmine test
describe("Climb & Downhill", () => {

  let climbDownHillAccumulator: ClimbDownHillAccumulator = null

  beforeAll(() => {
    const locations = track.locations.filter(location => location.dem)
    const ts = new timeseries.main(timeseries.adapter.fromDB(locations, {
      date: 'timestamp',
      value: 'dem'
    }));
    climbDownHillAccumulator = LiveTrack.updateClimbDownhill(ts.smoother({
      period: 5
    }).output())
  })

  it("climb is positive", () => {
    expect(climbDownHillAccumulator.climb).toBeGreaterThan(0);
  });

  it("downhill is positive", () => {
    expect(climbDownHillAccumulator.downhill).toBeGreaterThan(0);
  });

});