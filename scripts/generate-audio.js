#!/usr/bin/env node

/**
 * Word to MP3 Generator using AWS Polly
 * 
 * This script takes a word as input and generates an mp3 file using AWS Polly.
 * The output is saved to public/audio/prompts/{word}.mp3
 * 
 * Required AWS permissions:
 * - polly:SynthesizeSpeech
 * 
 * Usage:
 * node generate-audio.js <word>
 * node generate-audio.js --batch words.txt
 * node generate-audio.js --voice Joanna --file words.txt
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { Polly } = require('@aws-sdk/client-polly');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

// Define the CLI program
const program = new Command();
program
  .name('generate-audio')
  .description('Generate MP3 files for words using AWS Polly')
  .version('1.0.0');

// Add command line options
program
  .argument('[word]', 'Word to convert to speech')
  .option('-b, --batch <file>', 'Process a batch of words from a file (one per line)')
  .option('-v, --voice <voice>', 'Voice to use for synthesis', 'Joanna')
  .option('-o, --output <dir>', 'Output directory', './public/audio/prompts')
  .option('-p, --profile <profile>', 'AWS profile to use', 'default')
  .option('-d, --dry-run', 'Show what would be done without making changes', false)
  .option('-f, --force', 'Overwrite existing files', false);

/**
 * Generate speech for a single word
 */
async function generateSpeech(word, options) {
  const { voice, output, profile, dryRun, force } = options;
  
  // Create output directory if it doesn't exist
  if (!dryRun) {
    fs.mkdirSync(output, { recursive: true });
  }
  
  const outputPath = path.join(output, `${word.toLowerCase()}.mp3`);
  
  // Check if file already exists
  if (fs.existsSync(outputPath) && !force) {
    console.log(`File already exists: ${outputPath}. Use --force to overwrite.`);
    return;
  }
  
  // Initialize AWS Polly client
  const polly = new Polly({
    credentials: fromIni({ profile }),
    region: 'us-east-1' // Default region, can be changed via AWS_REGION env var
  });
  
  // Configure speech parameters
  const params = {
    Engine: 'neural',
    OutputFormat: 'mp3',
    Text: `<speak><prosody rate="slow">${word}</prosody></speak>`,
    TextType: 'ssml',
    VoiceId: voice
  };
  
  try {
    if (dryRun) {
      console.log(`Would generate speech for "${word}" using voice ${voice} to ${outputPath}`);
      return;
    }
    
    console.log(`Generating speech for "${word}" using voice ${voice}...`);
    
    // Synthesize speech
    const response = await polly.synthesizeSpeech(params);
    
    // Save to file if successful
    if (response.AudioStream) {
      const audioBuffer = await streamToBuffer(response.AudioStream);
      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`Speech saved to ${outputPath}`);
    }
  } catch (error) {
    console.error(`Error generating speech for word "${word}":`, error);
    throw error;
  }
}

/**
 * Process words from a file
 */
async function processBatchFile(filePath, options) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const words = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log(`Processing ${words.length} words from ${filePath}`);
    
    for (const word of words) {
      try {
        await generateSpeech(word, options);
      } catch (error) {
        console.error(`Failed to process word "${word}". Continuing with next word.`);
      }
    }
    
    console.log('Batch processing complete.');
  } catch (error) {
    console.error(`Error reading batch file ${filePath}:`, error);
    process.exit(1);
  }
}

/**
 * Convert a readable stream to a buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function main() {
  program.parse();
  
  const options = program.opts();
  const args = program.args;
  
  try {
    // Handle batch processing
    if (options.batch) {
      await processBatchFile(options.batch, options);
      return;
    }
    
    // Handle single word
    if (args.length > 0) {
      const word = args[0];
      await generateSpeech(word, options);
      return;
    }
    
    // No word or batch file specified
    console.error('Error: Please provide a word or use the --batch option.');
    program.help();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();