import { AudioPlayer } from './audio-player';

const MOCK_RESPONSE = {
  arrayBuffer: jest.fn().mockResolvedValue(0)
};

const origFetch = global.fetch;
global.fetch = jest.fn(() => Promise.resolve(MOCK_RESPONSE)) as jest.Mock;


describe('AudioPlayer', () => {

});
