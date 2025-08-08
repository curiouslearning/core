import { AudioPlayer } from './audio-player';

const origFetch = global.fetch;

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);


describe('AudioPlayer', () => {
  let player: AudioPlayer;
  const mockDecodeAudioData = jest.fn((data) => Promise.resolve({ decoded: true, data }));
  const mockCreateBufferSource = jest.fn(() => {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      onended: null,
      buffer: null
    };
  });

  (global as any).AudioContext = jest.fn().mockImplementation(() => ({
    decodeAudioData: mockDecodeAudioData,
    createBufferSource: mockCreateBufferSource,
    destination: 'mock-destination'
  }));

  afterAll(() => {
    global.fetch = origFetch;
    jest.clearAllMocks();
  });

  describe('Given Mock Settings', () => {
    const src = 'test-audio.mp3';

    beforeAll(() => {
      player = new AudioPlayer({ maxBufferSize: 5 });
      
    });
    
    describe('When calling load()', () => {

    });

    describe('When calling play()', () => {
      it('should load', async () => {
        const buffer = await player.load(src);
        expect(global.fetch).toHaveBeenCalledWith(src);
        expect(mockDecodeAudioData).toHaveBeenCalled();
        expect(buffer).toBeDefined();
      });
      
      it('should play', async () => {
        const result = await player.play(src);
        expect(mockCreateBufferSource).toHaveBeenCalled();
        const sourceNode = mockCreateBufferSource.mock.results[0].value;
        expect(sourceNode.connect).toHaveBeenCalledWith('mock-destination');
        expect(sourceNode.start).toHaveBeenCalled();
        expect(result).toBe(sourceNode);
      });
    });
  });
});
