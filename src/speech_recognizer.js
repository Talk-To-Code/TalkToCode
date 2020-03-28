const recorder = require('node-record-lpcm16');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

// Creates a client
const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
const model = 'default';

const request = {
  "config": {
    "encoding": encoding,
    "sampleRateHertz": sampleRateHertz,
    "languageCode": languageCode,
    "model":model,
    "speechContexts": [{
      "phrases": ["begin if","do-while","cut block", "exit block","equal 1","equal 2","equal 3","equal 4","equal 5","equal 6","equal 7","equal 8","equal 9",
    "line 1","line 2","line 3","line 4","line 5","line 6","comment if","paste above","paste below","typecast variable","uncomment block","line 18","line 19","line"]
    }]
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    process.stdout.write(
      data.results[0] && data.results[0].alternatives[0]
        ? `${data.results[0].alternatives[0].transcript}`
        : `\n\nReached transcription time limit, press Ctrl+C\n`
    )
  );

// Start recording and send the microphone input to the Speech API
recorder
  .record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '30.0',
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening');