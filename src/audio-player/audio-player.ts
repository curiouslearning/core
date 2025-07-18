import { FifoMap } from '@songbaek/fifo-map';

export interface AudioPlayerPlayOptions {
  /**
   * Stops all other audio currently playing.
   */
  stopAll?: boolean;

  /**
   * Play the audio in loop.
   */
  loop?: boolean;

  /**
   * Callback triggered when the audio is stopped or when it ends.
   */
  onended?: (event: Event) => void;

  /**
   * By default, only a single instance of a given source will be played. Setting this to true will allow the player to play multiple instances.
   */
  overlap?: boolean;

  /**
   * Delays the audio to be played in miliseconds.
   */
  throttle?: number;

  /**
   * Works in conjunction with throttle. A function check to be called whether a throttled audio should still be played or not.
   */
  throttleCheck?: () => boolean;
}

export interface AudioPlayerOptions {
  /**
   * The maximum number of buffered audio. Defaults to 10.
   * 
   * This maintains a number of buffered audio in memory, and prevent rebuffering once stored.
   * 
   * Stored audio are kept in FIFO manner, where older/stale files will be replaced by new ones.
   * 
   * The default value is arbitrary and can be set according to need.
   */
  maxBufferSize: number;
}

/**
 * Curious Learning audio player class.
 * 
 * Used to load, store and play audio files concurrently, or in succession.
 */
export class AudioPlayer {

  protected audioContext = new AudioContext();
  protected audioBuffersMap: FifoMap<string, AudioBuffer>;
  protected audioPlayingMap: Map<string, AudioBufferSourceNode> = new Map();
  constructor(options: AudioPlayerOptions) {
    this.audioBuffersMap = new FifoMap({ maxSize: options?.maxBufferSize || 10 });
  }

  /**
   * Loads the file source.
   * @param src The audio file source
   */
  async load(src: string): Promise<AudioBuffer> {
    if (this.audioBuffersMap.get(src)) return Promise.resolve(this.audioBuffersMap.get(src));

    return new Promise<AudioBuffer>(async (resolve, reject) => {
      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffersMap.put(src, audioBuffer);
        resolve(audioBuffer);
      } catch (error) {
        console.error("Error loading or decoding audio:", error);
        reject(error);
      }
    });
  }

  /**
   * Plays the audio file.
   * 
   * If the same audio is already playing, it will do nothing.
   * 
   * @param src source of audio file to be played
   * @param options play options
   * @returns 
   */
  async play(src: string, options?: AudioPlayerPlayOptions) {
    // if its playing and overlap is false or not defined, do not play.
    const isOverlap = options?.overlap;
    if (!isOverlap && this.audioPlayingMap.get(src)) return;

    const audioBuffer = await this.load(src);
    return new Promise(async (resolve, reject) => {
      const throttle = options?.throttle || 0;
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = options?.loop;
      sourceNode.onended = (event) => {
        this.stop(src);
        if (options?.onended) options.onended(event);
      }
      this.audioPlayingMap.set(isOverlap ? `${src}-overlap-${this.audioPlayingMap.size}` : src, sourceNode);
      setTimeout(() => {
        if (options?.throttleCheck && !options.throttleCheck()) {
          this.audioPlayingMap.delete(src);
          return resolve('Cancelled play, due to throttleCheck being set and resulting to false');
        }

        sourceNode.connect(this.audioContext.destination);
        sourceNode.start();
        resolve(sourceNode);
      }, throttle);
    })
  }

  /**
   * Play audio files in succession.
   * @param sources array of audio file sources
   * @returns 
   */
  async playQueue(sources: string[]) {
    if (!sources || !sources.length) return;
    const firstSource = sources.shift();

    if (!firstSource) return;
    
    const options = {
      onended: () => this.playQueue(sources)
    }

    return this.play(firstSource, options);
  }

  /**
   * Stops the audio with the given file source.
   * @param src the audio file source that will be stopped.
   */
  stop(src: string): void {
    this.audioPlayingMap.get(src)?.disconnect();
    this.audioPlayingMap.get(src)?.stop();
    this.audioPlayingMap.delete(src);
  }

  /**
   * Stops all audio concurrently playing.
   */
  stopAll(): void {
    for (const [key] of this.audioPlayingMap) {
      this.stop(key);
    }
  }
}