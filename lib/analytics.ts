import { initMixpanel, identify as mpIdentify, setSuperProperties as mpSet, track as mpTrack } from './mixpanel';

export const analytics = {
  init: initMixpanel,
  identify: mpIdentify,
  setSuper: mpSet,
  track: mpTrack,
};


