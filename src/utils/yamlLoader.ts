import yaml from 'yaml';

/**
 * Generic function to load and parse YAML content
 * 
 * @param content - The YAML content as a string
 * @returns The parsed YAML data
 */
export function parseYaml<T>(content: string): T {
  try {
    return yaml.parse(content) as T;
  } catch (error) {
    console.error('Error parsing YAML content:', error);
    throw new Error('Failed to parse YAML content');
  }
}

/**
 * Helper function to load a YAML file using fetch
 * This is useful for loading data files in the public directory
 * 
 * @param filePath - Path to the YAML file (relative to public directory)
 * @returns A Promise that resolves to the parsed YAML data
 */
export async function loadYamlFile<T>(filePath: string): Promise<T> {
  try {
    // Fetch the YAML file
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load YAML file: ${response.statusText}`);
    }
    
    // Get the YAML content as text
    const yamlContent = await response.text();
    
    // Parse the YAML content
    return parseYaml<T>(yamlContent);
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error);
    throw error;
  }
}