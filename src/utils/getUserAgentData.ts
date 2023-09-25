/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import useragent from 'express-useragent';

function getUserAgentData(ua = '') {
  const {
    browser: browserName,
    version,
    os: osName,
    platform,
  } = useragent.parse(ua);

  return {
    browser: {
      name: browserName,
      version: parseInt(version, 10) || 0,
    },
    os: {
      name: osName,
      platform,
    },
  };
}

export default getUserAgentData;
