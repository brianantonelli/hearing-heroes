# Hearing Heroes Utility Scripts

This directory contains utility scripts for the Hearing Heroes game project.

## Audio Generation

The `generate-audio.js` script helps to create mp3 audio files using AWS Polly.

### Prerequisites

1. AWS account with access to Polly service
2. AWS CLI configured with credentials
3. Node.js installed

### Setup

```bash
# Install dependencies
cd scripts
npm install
```

### Usage

#### Generate a single word

```bash
node generate-audio.js word
```

#### Process multiple words from a file

```bash
node generate-audio.js --batch words.txt
```

#### Change the voice

```bash
node generate-audio.js --voice Matthew word
```

#### Additional Options

- `--output <dir>` - Change the output directory (default: `./public/audio/prompts`)
- `--profile <profile>` - Use a specific AWS profile (default: `default`)
- `--dry-run` - Show what would be done without making changes
- `--force` - Overwrite existing files

### Example Batch File

Create a text file with one word per line:

```
cat
dog
fish
bird
```

Then run:

```bash
node generate-audio.js --batch animals.txt
```

### Available Voices

Some popular English voices in AWS Polly:

- **US English**: Joanna (default), Matthew, Salli, Kimberly, Kevin, Ivy
- **British English**: Amy, Emma, Brian
- **Australian English**: Nicole, Russell